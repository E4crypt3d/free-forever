#!/usr/bin/env node
/* Free Forever — static SEO + agent surface generator.
 *
 * The page renders its 42 entries with JavaScript, which means crawlers that do
 * not execute JavaScript (most AI agents, most scrapers, print tools, readers
 * with JS off) see an empty shell. This script writes the machine-readable
 * layer FROM data/tools.js, so none of it can drift from the page:
 *
 *   index.html      the meta descriptions, the JSON-LD graph (42 ItemList
 *                   items), and a <noscript> copy of every entry
 *   feed.json       the whole dataset, stable key names, for agents
 *   llms.txt        short map of the site for LLMs
 *   llms-full.txt   every entry in Markdown, for LLMs
 *   sitemap.xml     <lastmod> from the newest "verified" date in the data
 *   assets/og-card.html  the share card source, with the live counts
 *
 * No dependencies. Run it after editing data/tools.js:
 *
 *   node scripts/build-static.mjs           # rewrite the generated regions
 *   node scripts/build-static.mjs --check    # fail if anything is stale
 *
 * The PNG share card is a screenshot of assets/og-card.html — see
 * scripts/make-cards.mjs. It is committed, so CI only checks the counts in it.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://e4crypt3d.github.io/free-forever/";
const CHECK = process.argv.includes("--check");

/* ── load the data exactly as the browser does ─────────────────────────── */

const sandbox = { window: {} };
createContext(sandbox);
runInContext(readFileSync(join(ROOT, "data/tools.js"), "utf8"), sandbox);

const TOOLS = sandbox.window.TOOLS;
const SOURCES = sandbox.window.SOURCES;
if (!Array.isArray(TOOLS) || !TOOLS.length) throw new Error("data/tools.js exported no TOOLS");

const counts = { forever: 0, limited: 0, reference: 0 };
for (const t of TOOLS) counts[t.tier] += 1;
const total = TOOLS.length;
const latest = TOOLS.map((t) => t.verified).sort().pop();
const earliest = TOOLS.map((t) => t.verified).sort()[0];
const TIER = { forever: "Free forever", limited: "Limited free", reference: "Reference" };

/* ── small helpers ─────────────────────────────────────────────────────── */

// For attribute values: quote, angle brackets and ampersand, but leave the
// apostrophe alone so "vendor's" reads as written in link previews.
const attr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// For text nodes: no apostrophe or quote escaping, so the no-JS copy reads
// cleanly when an agent strips the tags.
const txt = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const host = (url) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const prettyDate = (iso) => {
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
};

/* Replace a marked region in a file, and return what the new file should be. */
function replaceRegion(file, start, end, body) {
  const src = readFileSync(join(ROOT, file), "utf8");
  const a = src.indexOf(start);
  const b = src.indexOf(end);
  if (a === -1 || b === -1 || b < a) throw new Error(`${file}: missing ${start} … ${end} markers`);
  return src.slice(0, a + start.length) + "\n" + body.trimEnd() + "\n" + src.slice(b);
}

/* ── index.html: meta ──────────────────────────────────────────────────── */

// Front-loads the query the page answers, keeps the three counts visible in
// search results, and stays under the ~60 characters Google renders.
const title = `Free AI coding tools, checked: ${counts.forever} free forever, ${counts.limited} trials`;
// ~155 characters: the pages Google and Bing show before truncating.
const descLong = `${total} AI coding tools sorted by how free they really are: ${counts.forever} free forever, ${counts.limited} limited, ${counts.reference} reference. Every number read from the vendor's own page.`;
const descShort = `${total} AI coding tools sorted by how free they really are. ${counts.forever} are free forever. ${counts.limited} are only a trial — and the catch is on every entry.`;
const imgAlt = `Free, or just free for now? ${counts.forever} tools free forever, ${counts.limited} limited free, ${counts.reference} reference.`;

const meta = `
<title>${attr(title)}</title>
<meta name="description" content="${attr(descLong)}">
<meta property="og:description" content="${attr(descShort)}">
<meta property="og:image:alt" content="${attr(imgAlt)}">
<meta name="twitter:description" content="${attr(descShort)}">
<meta name="twitter:image:alt" content="${attr(imgAlt)}">
`;

/* ── index.html: JSON-LD ───────────────────────────────────────────────── */

const webpage = {
  "@type": "WebPage",
  "@id": `${SITE}#webpage`,
  url: SITE,
  name: "Free, or just free for now?",
  description: descLong,
  inLanguage: "en-GB",
  isPartOf: { "@id": `${SITE}#website` },
  isAccessibleForFree: true,
  datePublished: earliest,
  dateModified: latest,
  primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}assets/og-card.png`, width: 1200, height: 630 },
  about: { "@type": "Thing", name: "Free tiers of AI coding tools" },
  significantLink: [`${SITE}feed.json`, `${SITE}llms.txt`]
};

const list = {
  "@type": "ItemList",
  "@id": `${SITE}#tools`,
  name: `AI coding tools by how free they are (${total})`,
  description: descLong,
  numberOfItems: total,
  itemOrder: "textually ordered by tier: free forever first",
  itemListElement: TOOLS.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    url: t.url,
    description: `${TIER[t.tier]}. ${t.tagline} The catch: ${t.catch[0]}`,
    item: {
      "@type": "SoftwareApplication",
      name: t.name,
      url: t.url,
      applicationCategory: t.category === "api" ? "DeveloperApplication" : "DeveloperApplication",
      operatingSystem: t.surfaces.join(", "),
      isAccessibleForFree: t.tier === "forever"
    }
  }))
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}#website`,
      url: SITE,
      name: "free forever",
      description: "A directory of AI coding tools sorted by how free they actually are, with the catch included on every entry.",
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE}#site` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE}?q={search_term_string}` },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${SITE}#site`,
      name: "free forever",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}assets/og-card.png`, width: 1200, height: 630 }
    },
    webpage,
    list
  ]
};

const ld = `<script type="application/ld+json" id="itemlist-ld">
${JSON.stringify(graph, null, 2)}
</script>`;

/* ── index.html: noscript copy of every entry ──────────────────────────── */

const noscriptBlocks = TOOLS.map((t) => {
  const sources = (t.sources || [])
    .map((k) => (SOURCES[k] ? `<a href="${attr(SOURCES[k])}" rel="nofollow noopener">${txt(k)}</a>` : ""))
    .filter(Boolean)
    .join(" · ");
  const catches = t.catch.map((c) => `<li>${txt(c)}</li>`).join("");
  return `      <article class="ns-entry" id="ns-${attr(t.id)}">
        <h3><a href="${attr(t.url)}" rel="noopener">${txt(t.name)}</a> <span class="ns-host">${txt(host(t.url))}</span></h3>
        <p class="ns-tags">${txt(TIER[t.tier])} · ${txt(t.tagline)}</p>
        <dl>
          <dt>Free</dt><dd>${txt(t.free)}</dd>
          <dt>Paid by</dt><dd>${txt(t.howPaid)}</dd>
          <dt>Runs on</dt><dd>${txt(t.surfaces.join(" · "))}</dd>
          <dt>Licence</dt><dd>${txt(t.licence)}</dd>
          <dt>Why it is here</dt><dd>${txt(t.why)}</dd>
        </dl>
        <ul class="ns-catch">${catches}</ul>
        <p class="ns-src">Read ${txt(t.verified)} (${txt(t.evidence === "vendor" ? "vendor page" : "directory")})${sources ? " · " + sources : ""}</p>
      </article>`;
});

const noscript = `<noscript id="static-entries">
  <p class="ns-note">This page uses JavaScript for the filters and search. Here is all ${total} of it as plain HTML. The same data, machine-readable: <a href="feed.json">feed.json</a> · <a href="llms.txt">llms.txt</a>.</p>
  <div class="ns-list">
${noscriptBlocks.join("\n")}
  </div>
</noscript>`;

/* ── feed.json ─────────────────────────────────────────────────────────── */

const feed = {
  $schema: "https://e4crypt3d.github.io/free-forever/feed.json",
  name: "free forever",
  description: descLong,
  homepage: SITE,
  license: "data is free to quote with attribution to the site",
  read: { first: earliest, latest },
  counts: { total, ...counts },
  tiers: {
    forever: "No card, no expiry. Funded by ads, a vendor, a university or your own hardware.",
    limited: "A real free allowance that runs out: monthly credits, a one-time grant, an unpublished cap, or a promotion the vendor can end.",
    reference: "Not tools: directories that probe their own rows, and student bundles that need verification."
  },
  evidence: {
    vendor: "Read on the company's own page. Their numbers, their words.",
    directory: "The company did not state it; the figure came from a directory that re-probes its rows on a schedule."
  },
  entries: TOOLS.map((t) => ({
    id: t.id,
    name: t.name,
    url: t.url,
    tier: t.tier,
    category: t.category,
    how: t.how,
    tagline: t.tagline,
    free: t.free,
    howPaid: t.howPaid,
    catch: t.catch,
    surfaces: t.surfaces,
    licence: t.licence,
    why: t.why,
    topPick: Boolean(t.pick),
    evidence: t.evidence,
    verified: t.verified,
    sources: (t.sources || []).map((k) => ({ label: k, url: SOURCES[k] })).filter((s) => s.url)
  }))
};

const feedJson = JSON.stringify(feed, null, 2) + "\n";

/* ── llms.txt ──────────────────────────────────────────────────────────── */

const llmsRows = TOOLS.map(
  (t) => `- [${t.name}](${t.url}) — ${TIER[t.tier]} — ${t.free}`
).join("\n");

const llms = `# free forever

> A directory of ${total} AI coding tools, sorted by how free they actually are: ${counts.forever} free forever (no card, no expiry), ${counts.limited} limited (a real allowance that runs out) and ${counts.reference} reference. Every allowance was read from the vendor's own page or from a directory that re-probes its rows, and every entry carries the catch the landing page does not mention. Last read ${prettyDate(latest)}.

This file is for language models and agents. Humans should use ${SITE}.

Machine-readable copies of the same data:

- [feed.json](${SITE}feed.json) — every entry as JSON (id, name, url, tier, free allowance, who pays, the catch as an array, licence, platforms, sources, verification date).
- [llms-full.txt](${SITE}llms-full.txt) — every entry in full Markdown.

How to read the tiers:

- **Free forever** — no card, no expiry. Who pays next month is an advertiser, a vendor, a university or your own hardware.
- **Limited free** — a genuine free allowance that runs out. Treat a one-time grant or an unpublished number as a trial.
- **Reference** — not tools: directories that probe their own rows, and student bundles.

Quoting: the entries are summaries of vendors' published numbers, with the source and date on each. Quote the date with the number; free tiers rot fast.

## Entries

${llmsRows}
`;

/* ── llms-full.txt ─────────────────────────────────────────────────────── */

const fullBlocks = TOOLS.map((t, i) => {
  const sources = (t.sources || []).map((k) => (SOURCES[k] ? `- ${k}: ${SOURCES[k]}` : "")).filter(Boolean);
  return `## ${i + 1}. ${t.name} — ${TIER[t.tier]}

${t.tagline}

- **URL:** ${t.url}
- **Free:** ${t.free}
- **Paid by:** ${t.howPaid}
- **Runs on:** ${t.surfaces.join(" · ")}
- **Licence:** ${t.licence}
- **Why it is on this page:** ${t.why}
- **Evidence:** ${t.evidence === "vendor" ? "vendor page" : "probed directory"} · read ${t.verified}
${t.pick ? "- **Top pick** on the page.\n" : ""}
The catch:

${t.catch.map((c) => `- ${c}`).join("\n")}

Sources:

${sources.join("\n")}
`;
});

const llmsFull = `# free forever — full entry text

Every entry on ${SITE}, in full, for language models. Read ${prettyDate(latest)}.
Totals: ${total} entries — ${counts.forever} free forever, ${counts.limited} limited free, ${counts.reference} reference.
Machine-readable: ${SITE}feed.json · Short map: ${SITE}llms.txt

${fullBlocks.join("\n")}
`;

/* ── sitemap.xml ───────────────────────────────────────────────────────── */

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${latest}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${SITE}assets/og-card.png</image:loc>
      <image:title>Free, or just free for now?</image:title>
      <image:caption>${total} AI coding tools: ${counts.forever} free forever, ${counts.limited} limited free, ${counts.reference} reference.</image:caption>
    </image:image>
  </url>
</urlset>
`;

/* ── share-card source: same counts, so the card cannot go stale ───────── */

const cardPath = join(ROOT, "assets/og-card.html");
const statsBlock = `<div class="stats">
        <div class="stat stat--forever"><b>${counts.forever}</b><span>Free forever</span></div>
        <div class="stat stat--limited"><b>${counts.limited}</b><span>Limited free</span></div>
        <div class="stat stat--reference"><b>${counts.reference}</b><span>Reference</span></div>
      </div>`;
const cardHtml = existsSync(cardPath)
  ? readFileSync(cardPath, "utf8")
      .replace(/<span class="eyebrow" id="card-eyebrow">[^<]*<\/span>/,
               `<span class="eyebrow" id="card-eyebrow">free forever · ${total} tools</span>`)
      .replace(/(<!--count:stats-->)[\s\S]*?(<!--\/count:stats-->)/,
               (_m, a, b) => `${a}\n      ${statsBlock}\n    ${b}`)
  : null;

/* ── write or check ────────────────────────────────────────────────────── */

// index.html holds three generated regions; apply them in sequence so the
// second and third edits see the file the first one produced.
const finalIndex = (() => {
  const base = readFileSync(join(ROOT, "index.html"), "utf8");
  const step = (src, start, end, body) => {
    const a = src.indexOf(start);
    const b = src.indexOf(end);
    if (a === -1 || b === -1 || b < a) throw new Error(`index.html: missing ${start} … ${end} markers`);
    return src.slice(0, a + start.length) + "\n" + body.trimEnd() + "\n" + src.slice(b);
  };
  return [
    ["<!-- seo:meta -->", "<!-- /seo:meta -->", meta],
    ["<!-- seo:ld -->", "<!-- /seo:ld -->", ld],
    ["<!-- seo:noscript -->", "<!-- /seo:noscript -->", noscript]
  ].reduce((acc, [start, end, body]) => step(acc, start, end, body), base);
})();

const finalOutputs = [
  ["index.html", finalIndex],
  ["feed.json", feedJson],
  ["llms.txt", llms],
  ["llms-full.txt", llmsFull],
  ["sitemap.xml", sitemap],
  ...(cardHtml ? [["assets/og-card.html", cardHtml]] : [])
];

let stale = [];
for (const [file, content] of finalOutputs) {
  const path = join(ROOT, file);
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (current === content) continue;
  if (CHECK) {
    stale.push(file);
  } else {
    writeFileSync(path, content);
    console.log("wrote", file);
  }
}

if (CHECK) {
  if (stale.length) {
    console.error("::error::generated files are stale — run: node scripts/build-static.mjs");
    for (const f of stale) console.error("  stale:", f);
    process.exit(1);
  }
  console.log(`ok: ${finalOutputs.length} generated files current · ${total} entries · read ${latest}`);
} else {
  console.log(`done: ${total} entries (${counts.forever}/${counts.limited}/${counts.reference}) · read ${latest}`);
}
