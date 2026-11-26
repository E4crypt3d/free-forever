/* Free Forever, the directory. Render, filter, sort, open. No dependencies.
 *
 * One dataset (window.TOOLS) rendered as one responsive list. Everything shown
 * on the page (counts, funding shares, the check date) is read back from that
 * dataset here, so data/tools.js is the only place a number is written down. */
(function () {
  "use strict";

  var TIER_LABEL = { forever: "Free forever", limited: "Limited", reference: "Reference" };
  var TIER_FULL = { forever: "Free forever", limited: "Limited free", reference: "Reference" };
  var TIER_ORDER = { forever: 0, limited: 1, reference: 2 };
  var HOW_LABEL = {
    ads: "Ads in the tool",
    "ads+offers": "Ads + offerwall",
    "ads+share": "Ads + revenue share",
    vendor: "Vendor-funded",
    gateway: "Free model pool",
    local: "Your own hardware",
    none: "Not stated"
  };
  var HOW_SHORT = {
    ads: "ads",
    "ads+offers": "offerwall",
    "ads+share": "rev-share",
    vendor: "vendor",
    gateway: "pool",
    local: "local"
  };
  // Shorter forms for the phone panel, where the host line has ~150px.
  var CAT_SHORT = {
    agent: "Terminal", ide: "Editor", chat: "Chat", api: "API",
    local: "Local", earn: "Earn", directory: "Directory", student: "Student"
  };
  var CAT_LABEL = {
    agent: "Terminal agent", ide: "Editor / IDE", chat: "Chat",
    api: "API / key", local: "Local runtime", earn: "Earn while you code",
    directory: "Directory", student: "Student bundle"
  };
  // One bucket per entry, decided by `how` alone: no tool is counted twice.
  var BUCKET = {
    ads: "ads",
    "ads+offers": "offers",
    "ads+share": "share",
    vendor: "vendor",
    gateway: "gateway",
    local: "local"
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function host(url) {
    try {
      var u = new URL(url);
      return u.host.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
    } catch (e) { return url; }
  }

  // The row shows the domain only: a 60 character docs path in a 200px column
  // wraps to four lines and breaks the rhythm of the whole list.
  function hostOnly(url) {
    try {
      return new URL(url).host.replace(/^www\./, "");
    } catch (e) { return url; }
  }

  // 2026-11-26 -> 26·11·26, the compact form used in the table.
  function shortDate(iso) {
    var p = String(iso || "").split("-");
    return p.length === 3 ? p[2] + "·" + p[1] + "·" + p[0].slice(2) : iso;
  }

  // Short, human label for a source key ("freecode-faq" -> "faq").
  function srcLabel(entry, key) {
    if (key === entry.id) return "site";
    if (key.indexOf(entry.id + "-") === 0) return key.slice(entry.id.length + 1);
    return key;
  }

  function srcLinks(entry) {
    return (entry.sources || []).map(function (key) {
      var url = window.SOURCES[key];
      if (!url) return "";
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' +
        esc(srcLabel(entry, key)) + "</a>";
    }).join("");
  }

  var CARET = '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
    '<path d="M2.5 4.5 6 8 9.5 4.5"/></svg>';

  function evidenceTag(entry) {
    var vendor = entry.evidence === "vendor";
    return '<span class="ev ev--' + esc(entry.evidence) + '" title="' +
      (vendor ? "Read on the vendor's own page" : "Details from a probed directory") + '">' +
      (vendor ? "vendor page" : "directory") + "</span>";
  }

  function tierMark(tier) {
    return '<span class="tier tier--' + esc(tier) + '">' + TIER_FULL[tier] + "</span>";
  }

  // ── One row: who it is, what you get, what it costs you ────────────────

  function entry(e, suffix) {
    var rest = e["catch"].slice(1);
    var uid = esc(e.id) + suffix;
    var listId = "catch-" + uid;
    var deepId = "deep-" + uid;
    var more = rest.length
      ? ' <button type="button" class="more" data-expand-catches aria-expanded="false" ' +
        'aria-controls="' + listId + '">+' + rest.length + " more</button>"
      : "";

    return [
      '<article class="row" id="t-' + uid + '" data-id="' + esc(e.id) + '" data-tier="' + esc(e.tier) +
        '" data-cat="' + esc(e.category) + '" data-how="' + esc(e.how) + '">',

        '<div class="row-id">',
          '<h3 class="row-title"><a class="row-name" href="' + esc(e.url) +
            '" target="_blank" rel="noopener">' + esc(e.name) + "</a></h3>",
          '<p class="row-meta">',
            '<a class="row-host" href="' + esc(e.url) + '" target="_blank" rel="noopener" title="' +
              esc(host(e.url)) + '">' + esc(hostOnly(e.url)) + "</a>",
            '<span class="row-dot" aria-hidden="true">·</span>',
            tierMark(e.tier),
          "</p>",
        "</div>",

        '<div class="row-main">',
          '<p class="row-free"><span class="vh">What you get free: </span>' + esc(e.free) + "</p>",

          '<p class="row-catch"><span class="catch-tag">Catch</span>' +
            '<span class="catch-text">' + esc(e["catch"][0]) + more + "</span></p>",

          '<ul class="catch-rest" id="' + listId + '" hidden>' +
            rest.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>",

          '<div class="deep" id="' + deepId + '" hidden>',
            '<dl class="deep-facts">',
              "<div><dt>Runs as</dt><dd>" + esc(CAT_LABEL[e.category] || e.category) + "</dd></div>",
              "<div class=\"wide\"><dt>Runs on</dt><dd>" + esc(e.surfaces.join(" · ")) + "</dd></div>",
              "<div><dt>Paid by</dt><dd>" + esc(HOW_LABEL[e.how] || e.how) + "</dd></div>",
              "<div><dt>Licence</dt><dd>" + esc(e.licence) + "</dd></div>",
              "<div><dt>Read</dt><dd>" + esc(e.verified) + "</dd></div>",
            "</dl>",
            '<p class="deep-why"><b>Why it is on this page</b>' + esc(e.why) + "</p>",
            '<p class="deep-src">Sources: ' + srcLinks(e) + " " + evidenceTag(e) + "</p>",
          "</div>",
        "</div>",

        '<div class="row-acts">',
          '<button type="button" class="row-more" data-open="' + deepId + '" aria-expanded="false" ' +
            'aria-controls="' + deepId + '" aria-label="Details and sources for ' + esc(e.name) + '" ' +
            'title="Details and sources">' + CARET + "</button>",
        "</div>",
      "</article>"
    ].join("");
  }

  function listHtml() {
    return window.TOOLS.map(function (e) { return entry(e, "t"); }).join("");
  }

  // Tier groups: stated once per tier instead of on all 42 rows. Only used
  // when the order is by tier, because that is when rows actually sit in
  // groups; sorting by name or date keeps the tier on the row instead.
  var GROUP_ORDER = ["forever", "limited", "reference"];
  var groupEls = {};

  function buildGroups() {
    GROUP_ORDER.forEach(function (tier) {
      var el = document.createElement("div");
      el.className = "grp grp--" + tier;
      el.dataset.grp = tier;
      el.hidden = true;
      el.innerHTML = '<span class="grp-name">' + TIER_FULL[tier] + "</span>";
      groupEls[tier] = el;
    });
  }

  // ── Mount ────────────────────────────────────────────────────────────────

  var mount = document.getElementById("cards");
  var tableBox = document.getElementById("table");
  var empty = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var clearBtn = document.getElementById("clear-search");
  var chipBar = document.getElementById("filters");
  var sortEl = document.getElementById("sort");
  var expandBtn = document.getElementById("expand-catches");

  window.TOOLS.forEach(function (t) {
    t._hay = [
      t.name, t.tagline, t.free, t.howPaid, t.licence, t.why,
      t.surfaces.join(" "), t["catch"].join(" "),
      TIER_FULL[t.tier], HOW_LABEL[t.how] || "", CAT_LABEL[t.category] || "",
      host(t.url)
    ].join(" ").toLowerCase();
  });
  var byId = {};
  window.TOOLS.forEach(function (t) { byId[t.id] = t; });

  tableBox.innerHTML = listHtml();
  mount.innerHTML = "";
  buildGroups();

  // Category and funding filters are built from the data, so a new category
  // in tools.js appears here without touching this file.
  function buildTags(el, field, labels, short) {
    var counts = {};
    window.TOOLS.forEach(function (t) {
      var v = t[field];
      if (!v || v === "none") return;
      counts[v] = (counts[v] || 0) + 1;
    });
    el.innerHTML = Object.keys(counts)
      .sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); })
      .map(function (v) {
        var label = (short && short[v]) || labels[v] || v;
        return '<button type="button" data-tag-group="' + esc(field) + '" data-value="' + esc(v) +
          '" aria-pressed="false" title="' + esc((labels[v] || v) + ": " + counts[v] + " entries") +
          '">' + esc(label) + " " + counts[v] + "</button>";
      }).join("");
  }
  buildTags(document.getElementById("cat-filters"), "category", CAT_LABEL);
  buildTags(document.getElementById("how-filters"), "how", HOW_LABEL, HOW_SHORT);

  // ── State ────────────────────────────────────────────────────────────────

  var state = {
    tier: "all",
    query: "",
    cats: [],
    hows: [],
    sort: "tier"
  };

  function matches(e) {
    if (state.tier !== "all" && e.tier !== state.tier) return false;
    if (state.cats.length && state.cats.indexOf(e.category) === -1) return false;
    if (state.hows.length && state.hows.indexOf(e.how) === -1) return false;
    if (!state.query) return true;
    return state.query.split(/\s+/).every(function (w) { return e._hay.indexOf(w) !== -1; });
  }

  function sorted(list) {
    var out = list.slice();
    if (state.sort === "name") {
      out.sort(function (a, b) { return a.name.localeCompare(b.name, "en", { sensitivity: "base" }); });
    } else if (state.sort === "read") {
      out.sort(function (a, b) {
        return (b.verified || "").localeCompare(a.verified || "") ||
          (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
      });
    } else {
      out.sort(function (a, b) {
        return (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]) ||
          (a.pick === b.pick ? 0 : a.pick ? -1 : 1) ||
          a.name.localeCompare(b.name, "en", { sensitivity: "base" });
      });
    }
    return out;
  }

  function paintChips() {
    Array.prototype.forEach.call(chipBar.querySelectorAll("button"), function (c) {
      var on = c.dataset.filter === state.tier;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-tag-group]"),
      function (b) {
        var set = b.dataset.tagGroup === "category" ? state.cats : state.hows;
        b.setAttribute("aria-pressed", set.indexOf(b.dataset.value) !== -1 ? "true" : "false");
      }
    );
  }

  // A filtered view is worth sharing. Fails quietly on file:// where history is restricted.
  function syncUrl() {
    try {
      var url = new URL(window.location.href);
      ["q", "tier", "cat", "how", "sort"].forEach(function (k) { url.searchParams.delete(k); });
      if (state.query) url.searchParams.set("q", state.query);
      if (state.tier !== "all") url.searchParams.set("tier", state.tier);
      if (state.cats.length) url.searchParams.set("cat", state.cats.join(","));
      if (state.hows.length) url.searchParams.set("how", state.hows.join(","));
      if (state.sort !== "tier") url.searchParams.set("sort", state.sort);
      window.history.replaceState(null, "", url);
    } catch (err) { /* deep links are a bonus, never block the page */ }
  }

  function apply() {
    var shown = sorted(window.TOOLS.filter(matches));

    // Reorder by moving the whole row, so a row can never separate from
    // its catch. Group headings are moved in the same pass, so they always
    // sit directly above the rows they describe.
    var grouped = state.sort === "tier";
    var ids = (grouped ? "g|" : "|") + shown.map(function (e) { return e.id; }).join("|");
    if (tableBox._order !== ids) {
      GROUP_ORDER.forEach(function (tier) { if (groupEls[tier]) groupEls[tier].hidden = true; });
      var lastTier = null;
      shown.forEach(function (e) {
        if (grouped && e.tier !== lastTier && groupEls[e.tier]) {
          var grp = groupEls[e.tier];
          grp.hidden = false;
          tableBox.appendChild(grp);
          lastTier = e.tier;
        }
        var row = tableBox.querySelector('.row[data-id="' + e.id + '"]');
        if (row) tableBox.appendChild(row);
      });
      tableBox._order = ids;
    }
    tableBox.classList.toggle("is-grouped", grouped);

    Array.prototype.forEach.call(tableBox.querySelectorAll(".row"), function (row) {
      row.hidden = !matches(byId[row.dataset.id]);
    });

    var active = state.cats.length + state.hows.length;
    var badge = document.getElementById("filter-count");
    if (badge) {
      badge.hidden = active === 0;
      badge.textContent = active;
    }
    var fbtn = document.getElementById("filters-btn");
    if (fbtn) fbtn.classList.toggle("is-on", active > 0);
    Array.prototype.forEach.call(mount.children, function (node) {
      node.hidden = !matches(byId[node.dataset.id]);
    });

    empty.hidden = shown.length > 0;
    countEl.innerHTML = shown.length === window.TOOLS.length && !state.query &&
      !state.cats.length && !state.hows.length
      ? "<b>" + shown.length + "</b> entries, every tier"
      : "<b>" + shown.length + "</b> of " + window.TOOLS.length +
        (state.tier === "all" ? "" : " · " + TIER_FULL[state.tier]) +
        (state.query ? " · “" + esc(state.query) + "”" : "") +
        (state.cats.length ? " · " + esc(state.cats.map(function (c) { return CAT_LABEL[c] || c; }).join(" + ")) : "") +
        (state.hows.length ? " · " + esc(state.hows.map(function (h) { return HOW_LABEL[h] || h; }).join(" + ")) : "");

    mount.dataset.filter = state.tier;
    tableBox.dataset.filter = state.tier;
    clearBtn.hidden = !state.query;
    paintChips();
    paintSort();
    paintExpand();
    syncUrl();
  }

  // ── Sorting ──────────────────────────────────────────────────────────────

  function paintSort() {
    if (sortEl) sortEl.value = state.sort;
  }

  function setSort(v) {
    state.sort = v;
    apply();
  }

  if (sortEl) sortEl.addEventListener("change", function () { setSort(sortEl.value); });

  tableBox.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-sort]");
    if (btn) setSort(btn.dataset.sort);
  });

  // ── Controls ─────────────────────────────────────────────────────────────

  function setTier(tier) { state.tier = tier; apply(); }
  function setQuery(q) {
    state.query = q.trim().toLowerCase();
    searchEl.value = q;
    apply();
  }
  function scrollToList() {
    var top = document.getElementById("list");
    if (top) {
      window.scrollTo({
        top: top.getBoundingClientRect().top + window.scrollY - 56,
        behavior: "smooth"
      });
    }
  }
  function focusSearch() {
    scrollToList();
    searchEl.focus({ preventScroll: true });
  }

  chipBar.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-filter]");
    if (btn) setTier(btn.dataset.filter);
  });

  document.querySelectorAll("[data-jump]").forEach(function (link) {
    link.addEventListener("click", function () { setTier(link.dataset.jump); });
  });

  clearBtn.addEventListener("click", function () {
    setQuery("");
    searchEl.focus({ preventScroll: true });
  });
  searchEl.addEventListener("input", function () { setQuery(searchEl.value); });

  document.getElementById("reset-search").addEventListener("click", function () {
    setQuery("");
    focusSearch();
  });
  document.getElementById("show-all").addEventListener("click", function () {
    state.tier = "all";
    state.cats = [];
    state.hows = [];
    setQuery("");
    focusSearch();
  });
  document.getElementById("reset-all").addEventListener("click", function () {
    state.tier = "all";
    state.cats = [];
    state.hows = [];
    state.sort = "tier";
    setQuery("");
  });

  var jumpSearch = document.getElementById("jump-search");
  if (jumpSearch) jumpSearch.addEventListener("click", focusSearch);

  // Category and funding filters live behind one button, so the toolbar keeps
  // three controls instead of ten.
  var filterBtn = document.getElementById("filters-btn");
  var filterMore = document.getElementById("filter-more");
  if (filterBtn && filterMore) {
    filterBtn.addEventListener("click", function () {
      var open = filterMore.hidden;
      filterMore.hidden = !open;
      filterBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("click", function (ev) {
    // A tag in a row promises "every entry that runs this way": clear what
    // contradicts that promise before narrowing, or the result is a lie.
    var tag = ev.target.closest("[data-tag-cat], [data-tag-how]");
    if (tag) {
      if (tag.dataset.tagCat) {
        state.cats = [tag.dataset.tagCat];
        state.hows = [];
      } else {
        state.hows = [tag.dataset.tagHow];
        state.cats = [];
      }
      state.tier = "all";
      setQuery("");
      focusSearch();
      return;
    }

    // The rail's own multi-select tags.
    var groupBtn = ev.target.closest("[data-tag-group]");
    if (groupBtn) {
      var list = groupBtn.dataset.tagGroup === "category" ? state.cats : state.hows;
      var i = list.indexOf(groupBtn.dataset.value);
      if (i === -1) list.push(groupBtn.dataset.value); else list.splice(i, 1);
      apply();
      return;
    }

    var more = ev.target.closest("[data-expand-catches]");
    if (more) {
      var ul = document.getElementById(more.getAttribute("aria-controls"));
      var open = more.getAttribute("aria-expanded") === "true";
      if (ul) ul.hidden = open;
      more.setAttribute("aria-expanded", open ? "false" : "true");
      var count = ul ? ul.children.length : 0;
      more.textContent = open ? "+" + count + " more" : "fewer";
      paintExpand();
      return;
    }

    // The caret in the third column opens the facts and sources for one row.
    var opener = ev.target.closest("[data-open]");
    if (opener) {
      var panel = document.getElementById(opener.getAttribute("data-open"));
      if (panel) {
        var shown = opener.getAttribute("aria-expanded") === "true";
        panel.hidden = shown;
        opener.setAttribute("aria-expanded", shown ? "false" : "true");
      }
    }
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "/" && document.activeElement !== searchEl) {
      ev.preventDefault();
      focusSearch();
    } else if (ev.key === "Escape" && document.activeElement === searchEl && state.query) {
      ev.preventDefault();
      setQuery("");
    }
  });

  // ── Deep links: ?tier=, ?q=, ?cat=, ?how=, ?sort= ────────────────────────

  function readUrl() {
    var p = new URLSearchParams(window.location.search);
    var tier = p.get("tier");
    state.tier = ["forever", "limited", "reference", "all"].indexOf(tier) !== -1 ? tier : "all";
    var q = p.get("q") || "";
    state.query = q.trim().toLowerCase();
    searchEl.value = q;
    state.cats = (p.get("cat") || "").split(",").filter(Boolean);
    state.hows = (p.get("how") || "").split(",").filter(Boolean);
    var s = p.get("sort");
    state.sort = ["tier", "name", "read"].indexOf(s) !== -1 ? s : "tier";
  }

  window.addEventListener("popstate", function () { readUrl(); apply(); });
  readUrl();
  apply();

  // ── Every number on the page is derived, never typed ─────────────────────

  (function deriveNumbers() {
    var counts = { forever: 0, limited: 0, reference: 0 };
    window.TOOLS.forEach(function (t) { counts[t.tier] += 1; });
    counts.all = window.TOOLS.length;

    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) {
      var n = counts[el.dataset.count];
      if (typeof n === "number") el.textContent = n;
    });

    // Each gauge's bar is that tier's share of the page.
    Array.prototype.forEach.call(document.querySelectorAll("[data-bar]"), function (el) {
      var n = counts[el.dataset.bar];
      if (typeof n === "number") {
        el.querySelector("i").style.width = Math.round((n / counts.all) * 100) + "%";
      }
    });

    var totalEl = document.getElementById("tier-total");
    if (totalEl) totalEl.textContent = counts.all;

    var buckets = {};
    window.TOOLS.forEach(function (t) {
      var b = BUCKET[t.how];
      if (!b) return; // reference entries are not tools and have no funding
      (buckets[b] = buckets[b] || []).push(t.name);
    });
    var tools = Object.keys(buckets).reduce(function (n, k) { return n + buckets[k].length; }, 0);

    Object.keys(buckets).forEach(function (key) {
      var names = buckets[key];
      var count = document.querySelector('[data-fund="' + key + '"]');
      if (count) count.textContent = names.length + (names.length === 1 ? " entry" : " entries");
      var bar = document.querySelector('[data-fund-bar="' + key + '"] i');
      if (bar) bar.style.width = Math.round((names.length / tools) * 100) + "%";
      var who = document.querySelector('[data-fund-who="' + key + '"]');
      if (who) {
        var head = names.slice(0, 8);
        who.textContent = head.join(" · ") +
          (names.length > head.length ? " · and " + (names.length - head.length) + " more" : "");
      }
    });

    // The bar shows the newest verification date in the data.
    var badge = document.querySelector("[data-latest-verified]");
    if (badge) {
      var latest = window.TOOLS.map(function (t) { return t.verified; }).sort().pop();
      if (latest) badge.textContent = "checked " + shortDate(latest);
    }
  })();

  // ── One control to read every catch ──────────────────────────────────────

  function visibleRows() {
    return Array.prototype.filter.call(
      tableBox.querySelectorAll(".row"),
      function (row) { return !row.hidden; }
    );
  }

  function syncRows(open) {
    Array.prototype.forEach.call(tableBox.querySelectorAll(".row"), function (row) {
      if (row.hidden) return;
      var more = row.querySelector("[data-expand-catches]");
      if (!more) return;
      var ul = document.getElementById(more.getAttribute("aria-controls"));
      if (ul) ul.hidden = !open;
      more.setAttribute("aria-expanded", open ? "true" : "false");
      more.textContent = open ? "fewer" : "+" + (ul ? ul.children.length : 0) + " more";
    });
  }

  function paintExpand() {
    if (!expandBtn) return;
    // Only meaningful where the collapsing rows are the ones on screen.
    expandBtn.hidden = visibleRows().length === 0;
    var on = expandBtn.getAttribute("aria-pressed") === "true";
    expandBtn.textContent = on ? "Fewer catches" : "All catches";
  }

  if (expandBtn) {
    expandBtn.addEventListener("click", function () {
      var open = expandBtn.getAttribute("aria-pressed") !== "true";
      expandBtn.setAttribute("aria-pressed", open ? "true" : "false");
      syncRows(open);
      paintExpand();
    });
    window.addEventListener("resize", paintExpand);
    syncRows(false);
  }
  paintExpand();

  // Only fill the ItemList structured data from the real data when the shipped
  // file had an empty list (opened from a fresh clone before the generator ran).
  (function fillItemList() {
    var node = document.getElementById("itemlist-ld");
    if (!node) return;
    try {
      var data = JSON.parse(node.textContent);
      var list = (data["@graph"] || []).filter(function (n) { return n["@type"] === "ItemList"; })[0];
      if (!list || (list.itemListElement || []).length) return;
      list.itemListElement = sorted(window.TOOLS).map(function (e, i) {
        return {
          "@type": "ListItem",
          position: i + 1,
          name: e.name,
          url: e.url,
          description: e.tagline + " " + TIER_FULL[e.tier] + ". The catch: " + e["catch"][0]
        };
      });
      node.textContent = JSON.stringify(data);
    } catch (err) { /* structured data is a bonus, never block the page */ }
  })();
})();
