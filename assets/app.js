/* Free Forever — render + filter. No dependencies. */
(function () {
  "use strict";

  var TIER_LABEL = { forever: "Free forever", limited: "Limited free", reference: "Reference" };
  var HOW_LABEL = {
    ads: "Ads in the tool",
    "ads+offers": "Ads + offerwall",
    vendor: "Vendor-funded",
    gateway: "Free model pool",
    local: "Your own hardware",
    none: "—"
  };
  var CAT_LABEL = {
    agent: "Terminal agent", ide: "Editor / IDE", chat: "Chat",
    api: "API / key", local: "Local runtime", earn: "Earn while you code",
    directory: "Directory", student: "Student bundle"
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function host(url) {
    try { return new URL(url).host.replace(/^www\./, "") + new URL(url).pathname.replace(/\/$/, ""); }
    catch (e) { return url; }
  }

  // Short, human label for a source key ("freecode-faq" -> "faq").
  function srcLabel(entry, key) {
    if (key === entry.id) return "site";
    if (key.indexOf(entry.id + "-") === 0) return key.slice(entry.id.length + 1);
    return key;
  }

  // The trust marker: the words stay plain, the source names are links.
  function srcMark(entry) {
    return (entry.evidence === "vendor" ? "vendor page" : "directory");
  }

  function srcLinks(entry) {
    return (entry.sources || []).map(function (key) {
      var url = window.SOURCES[key];
      if (!url) return "";
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' +
        esc(srcLabel(entry, key)) + "</a>";
    }).join("");
  }

  function card(e) {
    var tags = [
      '<span class="tag tag--' + esc(e.tier) + '">' + esc(TIER_LABEL[e.tier]) + "</span>",
      e.pick ? '<span class="tag tag--pick">top pick</span>' : "",
      '<button type="button" class="tag tag--plain tag--link" data-tag-cat="' + esc(e.category) +
        '" title="Show every ' + esc(CAT_LABEL[e.category] || e.category) + ' entry">' +
        esc(CAT_LABEL[e.category] || e.category) + "</button>",
      e.how !== "none"
        ? '<button type="button" class="tag tag--plain tag--link" data-tag-how="' + esc(e.how) +
          '" title="Show every entry paid for this way">' + esc(HOW_LABEL[e.how] || e.how) + "</button>"
        : ""
    ].join("");

    var catches = e.catch.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");

    return [
      '<article class="tcard" data-id="' + esc(e.id) + '" data-tier="' + esc(e.tier) + '">',
        '<div class="tcard-head">',
          '<div class="tcard-name">',
            '<h3><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + "</a></h3>",
            '<span class="tcard-host">' + esc(host(e.url)) + "</span>",
          "</div>",
          '<div class="tagrow">' + tags + "</div>",
        "</div>",
        '<p class="pitch">' + esc(e.tagline) + "</p>",
        '<dl class="facts">',
          '<div class="fact fact--wide"><dt>What you get free</dt><dd>' + esc(e.free) + "</dd></div>",
          '<div class="fact fact--wide"><dt>Who pays for it</dt><dd>' + esc(e.howPaid) + "</dd></div>",
          '<div class="fact"><dt>Runs on</dt><dd>' + esc(e.surfaces.join(" · ")) + "</dd></div>",
          '<div class="fact"><dt>Licence</dt><dd>' + esc(e.licence) + "</dd></div>",
          '<div class="fact fact--wide"><dt>Why it is on this page</dt><dd>' + esc(e.why) + "</dd></div>",
        "</dl>",
        '<div class="catchbox"><h4>The catch</h4><ul>' + catches + "</ul></div>",
        '<div class="tcard-foot">',
          '<span class="src">Read ' + esc(e.verified) + " · " + srcLinks(e) + "</span>",
          '<span class="ev ev--' + esc(e.evidence) + '" title="' +
            (e.evidence === "vendor" ? "Read on the vendor's own page" : "Details from a probed directory") +
          '">' + (e.evidence === "vendor" ? "vendor page" : "directory") + "</span>",
        "</div>",
      "</article>"
    ].join("");
  }



  // Licence cells get a short label; the full wording lives in the card and the title attribute.
  function shortLic(str) {
    var l = str.toLowerCase();
    if (l.indexOf("apache") !== -1) return "Apache-2.0";
    if (l.indexOf("mit") !== -1) return "MIT";
    if (l.indexOf("proprietary") !== -1) return "Proprietary";
    if (l.indexOf("research") !== -1) return "Research";
    if (l.indexOf("not stated") !== -1) return "Not stated";
    if (l.indexOf("open source") !== -1) return "Open source";
    if (l.indexOf("n/a") === 0) return "—";
    return str.length > 22 ? str.slice(0, 21) + "…" : str;
  }

  // Desktop row: one wide horizontal card per tool. Name and tier on the left,
  // the three things that decide anything in the middle, the catch on the right.
  function row(e) {
    var top = e.catch[0];
    var rest = e.catch.length - 1;

    return [
      '<article class="drow" data-id="' + esc(e.id) + '" data-tier="' + esc(e.tier) + '">',

        '<div class="drow-id">',
          '<a class="drow-name" href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + "</a>",
          '<a class="drow-host" href="' + esc(e.url) + '" target="_blank" rel="noopener">' +
            esc(host(e.url)) + "</a>",
          '<span class="drow-cat">',
            '<button type="button" class="tag--link" data-tag-cat="' + esc(e.category) + '">' +
              esc(CAT_LABEL[e.category] || e.category) + "</button>",
            e.how !== "none"
              ? '<i>·</i><button type="button" class="tag--link" data-tag-how="' + esc(e.how) + '">' +
                esc(HOW_LABEL[e.how]) + "</button>"
              : "",
          "</span>",
        "</div>",

        '<div class="drow-body">',
          '<p class="drow-pitch">' + esc(e.tagline) + "</p>",
          '<dl class="drow-facts">',
            "<div><dt>Free</dt><dd>" + esc(e.free) + "</dd></div>",
            "<div><dt>Paid by</dt><dd>" + esc(e.howPaid) + "</dd></div>",
            "<div><dt>Runs on</dt><dd>" + esc(e.surfaces.join(" · ")) + "</dd></div>",
            "<div><dt>Licence</dt><dd>" + esc(e.licence) + "</dd></div>",
          "</dl>",
        "</div>",

        '<div class="drow-catch">',
          '<span class="drow-catch-label">Catch</span>',
          "<p>" + esc(top) + "</p>",
          rest ? '<span class="drow-more">+ ' + rest + " more in the full entry</span>" : "",
        "</div>",

        '<div class="drow-meta">',
          '<span class="drow-tier">' + esc(TIER_LABEL[e.tier]) + "</span>",
          e.pick ? '<span class="drow-pick">pick</span>' : "",
          '<span class="drow-src">' + srcLinks(e) + "</span>",
          '<span class="drow-ev ev ev--' + esc(e.evidence) + '" title="' +
            (e.evidence === "vendor" ? "Read on the vendor's own page" : "Details from a probed directory") +
          '">' + srcMark(e) + "</span>",
        "</div>",

      "</article>"
    ].join("");
  }

  var mount = document.getElementById("cards");
  var table = document.getElementById("table");
  var empty = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var chipBar = document.getElementById("filters");

  mount.innerHTML = window.TOOLS.map(card).join("");
  table.innerHTML = window.TOOLS.map(row).join("");

  var state = { filter: "forever", query: "" };

  function haystack(e) {
    return [
      e.name, e.tagline, e.free, e.howPaid, e.licence, e.why,
      e.surfaces.join(" "), e.catch.join(" "),
      TIER_LABEL[e.tier], HOW_LABEL[e.how] || "", CAT_LABEL[e.category] || "",
      host(e.url)
    ].join(" ").toLowerCase();
  }
  window.TOOLS.forEach(function (t) { t._hay = haystack(t); });

  function apply() {
    var byId = {};
    window.TOOLS.forEach(function (t) { byId[t.id] = t; });

    function visible(e) {
      if (state.filter !== "all" && e.tier !== state.filter) return false;
      if (!state.query) return true;
      return state.query.split(/\s+/).every(function (w) { return e._hay.indexOf(w) !== -1; });
    }

    [mount.children, table.children].forEach(function (list) {
      Array.prototype.forEach.call(list, function (node) {
        node.hidden = !visible(byId[node.dataset.id]);
      });
    });

    var shown = window.TOOLS.filter(visible).length;
    empty.hidden = shown > 0;
    table.hidden = shown === 0;
    countEl.textContent = shown + (shown === 1 ? " tool" : " tools") +
      (state.query ? " · matching “" + state.query + "”" : "");
  }

  chipBar.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".chip");
    if (!btn) return;
    Array.prototype.forEach.call(chipBar.querySelectorAll(".chip"), function (c) {
      c.classList.toggle("is-on", c === btn);
    });
    state.filter = btn.dataset.filter;
    apply();
  });

  document.querySelectorAll("[data-jump]").forEach(function (link) {
    link.addEventListener("click", function () {
      var tier = link.dataset.jump;
      var btn = chipBar.querySelector('[data-filter="' + tier + '"]');
      if (!btn) return;
      Array.prototype.forEach.call(chipBar.querySelectorAll(".chip"), function (c) {
        c.classList.toggle("is-on", c === btn);
      });
      state.filter = tier;
      apply();
    });
  });

  // Deep link support: /?q=ads or /?tier=forever (used by the SearchAction
  // structured data and by any link we share).
  (function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var tier = params.get("tier");
    if (tier && ["forever", "limited", "reference", "all"].indexOf(tier) !== -1) {
      var chip = chipBar.querySelector('[data-filter="' + tier + '"]');
      if (chip) {
        Array.prototype.forEach.call(chipBar.querySelectorAll(".chip"), function (c) {
          c.classList.toggle("is-on", c === chip);
        });
        state.filter = tier;
      }
    }
    if (q) {
      searchEl.value = q;
      state.query = q.trim().toLowerCase();
    }
  })();

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value.trim().toLowerCase();
    apply();
  });

  // Clicking a tag on an entry filters the list by that word.
  document.addEventListener("click", function (ev) {
    var tag = ev.target.closest("[data-tag-cat], [data-tag-how]");
    if (!tag) return;
    var label = tag.dataset.tagCat
      ? (CAT_LABEL[tag.dataset.tagCat] || tag.dataset.tagCat)
      : (HOW_LABEL[tag.dataset.tagHow] || tag.dataset.tagHow);
    searchEl.value = label;
    state.query = label.toLowerCase();
    apply();
    var listTop = document.getElementById("list");
    if (listTop) window.scrollTo({ top: listTop.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" });
    searchEl.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "/" && document.activeElement !== searchEl) {
      ev.preventDefault();
      searchEl.focus();
    }
  });

  apply();

  // Fill the ItemList structured data from the real data, so search engines see
  // the same 42 entries a reader does (and only those marked free forever first).
  (function fillItemList() {
    var node = document.getElementById("itemlist-ld");
    if (!node) return;
    try {
      var data = JSON.parse(node.textContent);
      var list = (data["@graph"] || []).filter(function (n) { return n["@type"] === "ItemList"; })[0];
      if (!list) return;
      var order = { forever: 0, limited: 1, reference: 2 };
      var sorted = window.TOOLS.slice().sort(function (a, b) {
        return (order[a.tier] - order[b.tier]) || (a.pick === b.pick ? 0 : a.pick ? -1 : 1);
      });
      list.itemListElement = sorted.map(function (e, i) {
        return {
          "@type": "ListItem",
          position: i + 1,
          name: e.name,
          url: e.url,
          description: e.tagline + " " + TIER_LABEL[e.tier] + ". The catch: " + e.catch[0]
        };
      });
      node.textContent = JSON.stringify(data);
    } catch (err) { /* structured data is a bonus, never block the page */ }
  })();
})();
