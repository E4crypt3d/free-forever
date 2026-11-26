/* Free Forever — render, filter, recover. No dependencies. */
(function () {
  "use strict";

  var TIER_LABEL = { forever: "Free forever", limited: "Limited free", reference: "Reference" };
  var HOW_LABEL = {
    ads: "Ads in the tool",
    "ads+offers": "Ads + offerwall",
    "ads+share": "Ads + revenue share",
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
    try {
      var u = new URL(url);
      return u.host.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
    } catch (e) { return url; }
  }

  // Short, human label for a source key ("freecode-faq" -> "faq").
  function srcLabel(entry, key) {
    if (key === entry.id) return "site";
    if (key.indexOf(entry.id + "-") === 0) return key.slice(entry.id.length + 1);
    return key;
  }

  function srcMark(entry) {
    return entry.evidence === "vendor" ? "vendor page" : "directory";
  }

  function srcLinks(entry) {
    return (entry.sources || []).map(function (key) {
      var url = window.SOURCES[key];
      if (!url) return "";
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' +
        esc(srcLabel(entry, key)) + "</a>";
    }).join("");
  }

  function evidenceBadge(entry, cls) {
    var title = entry.evidence === "vendor"
      ? "Read on the vendor's own page"
      : "Details from a probed directory";
    return '<span class="' + cls + ' ev ev--' + esc(entry.evidence) + '" title="' + title + '">' +
      srcMark(entry) + "</span>";
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

    var catches = e["catch"].map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");

    return [
      '<article class="tcard" data-id="' + esc(e.id) + '" data-tier="' + esc(e.tier) + '">',
        '<div class="tcard-head">',
          '<div class="tcard-name">',
            '<h3><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + "</a></h3>",
            '<span class="tcard-host"><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' +
              esc(host(e.url)) + "</a></span>",
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
          evidenceBadge(e, "ev"),
        "</div>",
      "</article>"
    ].join("");
  }

  // Desktop row: one wide horizontal card per tool. Every catch is reachable —
  // the first is shown, the rest live behind a real disclosure control.
  function row(e) {
    var catches = e["catch"].map(function (c, i) {
      return '<li' + (i ? ' class="catch-extra" hidden' : "") + ">" + esc(c) + "</li>";
    }).join("");
    var extra = e["catch"].length - 1;
    var listId = "catch-" + esc(e.id);

    return [
      '<article class="drow" data-id="' + esc(e.id) + '" data-tier="' + esc(e.tier) + '">',

        '<div class="drow-id">',
          '<a class="drow-name" href="' + esc(e.url) + '" target="_blank" rel="noopener">' +
            esc(e.name) +
            '<svg class="ext" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
            '<path d="M3.5 8.5 8.5 3.5M4.75 3.5h3.75v3.75"/></svg></a>',
          '<a class="drow-host" href="' + esc(e.url) + '" target="_blank" rel="noopener">' +
            esc(host(e.url)) + "</a>",
          '<span class="drow-cat">',
            '<button type="button" class="tag--link" data-tag-cat="' + esc(e.category) + '">' +
              esc(CAT_LABEL[e.category] || e.category) + "</button>",
            e.how !== "none"
              ? '<button type="button" class="tag--link" data-tag-how="' + esc(e.how) + '">' +
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
          '<ul class="drow-catch-list" id="' + listId + '">' + catches + "</ul>",
          extra
            ? '<button type="button" class="drow-more" data-expand-catches aria-expanded="false" aria-controls="' +
              listId + '">+ ' + extra + " more</button>"
            : "",
        "</div>",

        '<div class="drow-meta">',
          '<span class="drow-tier">' + esc(TIER_LABEL[e.tier]) + "</span>",
          e.pick ? '<span class="drow-pick">pick</span>' : "",
          '<span class="drow-src">' + srcLinks(e) + "</span>",
          evidenceBadge(e, "drow-ev"),
        "</div>",

      "</article>"
    ].join("");
  }

  var mount = document.getElementById("cards");
  var table = document.getElementById("table");
  var empty = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var searchEl = document.getElementById("search");
  var clearBtn = document.getElementById("clear-search");
  var chipBar = document.getElementById("filters");

  mount.innerHTML = window.TOOLS.map(card).join("");
  table.innerHTML = window.TOOLS.map(row).join("");

  var state = { filter: "forever", query: "" };

  function haystack(e) {
    return [
      e.name, e.tagline, e.free, e.howPaid, e.licence, e.why,
      e.surfaces.join(" "), e["catch"].join(" "),
      TIER_LABEL[e.tier], HOW_LABEL[e.how] || "", CAT_LABEL[e.category] || "",
      host(e.url)
    ].join(" ").toLowerCase();
  }
  window.TOOLS.forEach(function (t) { t._hay = haystack(t); });
  var byId = {};
  window.TOOLS.forEach(function (t) { byId[t.id] = t; });

  // The chips are a single-select set: keep their visual and announced state together.
  function paintChips() {
    Array.prototype.forEach.call(chipBar.querySelectorAll(".chip"), function (c) {
      var on = c.dataset.filter === state.filter;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // A filtered view is worth sharing. Fails quietly on file:// where history is restricted.
  function syncUrl() {
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete("q");
      url.searchParams.delete("tier");
      if (state.query) url.searchParams.set("q", state.query);
      if (state.filter !== "forever") url.searchParams.set("tier", state.filter);
      window.history.replaceState(null, "", url);
    } catch (err) { /* deep links are a bonus, never block the page */ }
  }

  function apply() {
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
    // Every count, date and funding bucket on the page is rendered from
    // window.TOOLS (see deriveNumbers), so a data edit can never leave a stale
    // number in the prose. These two attributes let the CSS drop the tier
    // badge when the list is already filtered to that tier.
    mount.dataset.filter = state.filter;
    table.dataset.filter = state.filter;
    if (expandBtn) syncRows(expandBtn.getAttribute("aria-pressed") === "true");
    paintExpand();
    countEl.textContent = shown + (shown === 1 ? " tool" : " tools") +
      (state.filter !== "all" ? " · " + TIER_LABEL[state.filter] : " · All tiers") +
      (state.query ? " · matching “" + state.query + "”" : "");
    clearBtn.hidden = !state.query;
    paintChips();
    syncUrl();
  }

  function setFilter(tier) {
    state.filter = tier;
    apply();
  }

  function setQuery(q) {
    state.query = q.trim().toLowerCase();
    searchEl.value = q;
    apply();
  }

  function scrollToList() {
    var listTop = document.getElementById("list");
    if (listTop) {
      window.scrollTo({
        top: listTop.getBoundingClientRect().top + window.scrollY - 72,
        behavior: "smooth"
      });
    }
  }

  chipBar.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".chip");
    if (btn) setFilter(btn.dataset.filter);
  });

  document.querySelectorAll("[data-jump]").forEach(function (link) {
    link.addEventListener("click", function () {
      setFilter(link.dataset.jump);
    });
  });

  clearBtn.addEventListener("click", function () {
    setQuery("");
    searchEl.focus({ preventScroll: true });
  });

  document.getElementById("reset-search").addEventListener("click", function () {
    setQuery("");
    searchEl.focus({ preventScroll: true });
  });

  document.getElementById("show-all").addEventListener("click", function () {
    state.filter = "all";
    setQuery("");
    searchEl.focus({ preventScroll: true });
  });

  searchEl.addEventListener("input", function () { setQuery(searchEl.value); });

  // Clicking a category or funding tag promises "every ... entry": clear the
  // tier filter first, otherwise the promise is false on the default view.
  document.addEventListener("click", function (ev) {
    var tag = ev.target.closest("[data-tag-cat], [data-tag-how]");
    if (tag) {
      var label = tag.dataset.tagCat
        ? (CAT_LABEL[tag.dataset.tagCat] || tag.dataset.tagCat)
        : (HOW_LABEL[tag.dataset.tagHow] || tag.dataset.tagHow);
      state.filter = "all";
      setQuery(label);
      scrollToList();
      searchEl.focus({ preventScroll: true });
      return;
    }

    var more = ev.target.closest("[data-expand-catches]");
    if (more) {
      var list = document.getElementById(more.getAttribute("aria-controls"));
      var open = more.getAttribute("aria-expanded") === "true";
      Array.prototype.forEach.call(list.querySelectorAll(".catch-extra"), function (li) {
        li.hidden = open;
      });
      more.setAttribute("aria-expanded", open ? "false" : "true");
      more.textContent = open ? "+ " + list.querySelectorAll(".catch-extra").length + " more" : "Show less";
      // Keep the one-click "expand all" control honest about the new state.
      if (expandBtn) {
        expandBtn.setAttribute("aria-pressed", rowsFullyOpen() ? "true" : "false");
        paintExpand();
      }
    }
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "/" && document.activeElement !== searchEl) {
      ev.preventDefault();
      searchEl.focus();
    } else if (ev.key === "Escape" && document.activeElement === searchEl && state.query) {
      ev.preventDefault();
      setQuery("");
    }
  });

  // Deep link support: /?q=ads or /?tier=limited (SearchAction structured data,
  // shared links, and back/forward after a replaceState).
  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var tier = params.get("tier");
    state.filter = (tier && ["forever", "limited", "reference", "all"].indexOf(tier) !== -1)
      ? tier : "forever";
    var q = params.get("q") || "";
    state.query = q.trim().toLowerCase();
    searchEl.value = q;
  }

  window.addEventListener("popstate", function () { readUrl(); apply(); });
  readUrl();
  apply();

  // ── Every number on the page is derived, never typed ──────────────────────
  // Phone cards, desktop rows, tier strip, chips, footer and the funding
  // buckets all read back from window.TOOLS. Editing data/tools.js cannot
  // leave a stale count or date in the prose again.
  (function deriveNumbers() {
    var counts = { forever: 0, limited: 0, reference: 0 };
    window.TOOLS.forEach(function (t) { counts[t.tier] += 1; });
    counts.all = window.TOOLS.length;

    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) {
      var n = counts[el.dataset.count];
      if (typeof n === "number") el.textContent = n;
    });

    // One bucket per entry, decided by `how` alone: no tool is counted twice
    // and nothing is hidden behind the word "several".
    var BUCKET = {
      ads: "ads",
      "ads+offers": "offers",
      "ads+share": "share",
      vendor: "vendor",
      gateway: "gateway",
      local: "local"
    };
    var buckets = {};
    window.TOOLS.forEach(function (t) {
      var b = BUCKET[t.how];
      if (!b) return; // reference entries are not tools and have no funding
      (buckets[b] = buckets[b] || []).push(t.name);
    });
    Object.keys(buckets).forEach(function (key) {
      var names = buckets[key];
      var count = document.querySelector('[data-fund="' + key + '"]');
      if (count) count.textContent = names.length + (names.length === 1 ? " entry" : " entries");
      var who = document.querySelector('[data-fund-who="' + key + '"]');
      if (who) {
        var head = names.slice(0, 8);
        who.textContent = head.join(" · ") +
          (names.length > head.length ? " · and " + (names.length - head.length) + " more" : "");
      }
    });

    // The badge in the top bar shows the newest verification date in the data.
    var badge = document.querySelector("[data-latest-verified]");
    if (badge) {
      var latest = window.TOOLS.map(function (t) { return t.verified; }).sort().pop();
      var parts = (latest || "").split("-");
      if (parts.length === 3) {
        badge.textContent = "re-checked " + parts[2] + "·" + parts[1] + "·" + parts[0].slice(2);
      }
    }
  })();

  // ── One control to read every catch ───────────────────────────────────────
  // Desktop puts all but the first catch of each row behind "+ N more". Reading
  // the lot used to mean forty-two clicks; this makes it one.
  var expandBtn = document.getElementById("expand-catches");

  function desktopRows() {
    return Array.prototype.filter.call(table.children, function (node) {
      return !node.hidden && node.offsetParent !== null;
    });
  }

  function rowsFullyOpen() {
    var rows = desktopRows().filter(function (row) {
      return row.querySelector("[data-expand-catches]");
    });
    if (!rows.length) return false;
    return rows.every(function (row) {
      return row.querySelector("[data-expand-catches]").getAttribute("aria-expanded") === "true";
    });
  }

  function syncRows(open) {
    Array.prototype.forEach.call(table.children, function (row) {
      if (row.hidden) return;
      var more = row.querySelector("[data-expand-catches]");
      if (!more) return;
      var list = document.getElementById(more.getAttribute("aria-controls"));
      Array.prototype.forEach.call(list.querySelectorAll(".catch-extra"), function (li) {
        li.hidden = !open;
      });
      more.setAttribute("aria-expanded", open ? "true" : "false");
      more.textContent = open
        ? "Show less"
        : "+ " + list.querySelectorAll(".catch-extra").length + " more";
    });
  }

  function paintExpand() {
    if (!expandBtn) return;
    // Only meaningful where the collapsing rows are the ones on screen.
    expandBtn.hidden = desktopRows().length === 0;
    var on = expandBtn.getAttribute("aria-pressed") === "true";
    expandBtn.textContent = on ? "Collapse all catches" : "Expand all catches";
  }

  if (expandBtn) {
    expandBtn.addEventListener("click", function () {
      var open = expandBtn.getAttribute("aria-pressed") !== "true";
      expandBtn.setAttribute("aria-pressed", open ? "true" : "false");
      syncRows(open);
      paintExpand();
    });
    window.addEventListener("resize", paintExpand);
    // apply() above ran before this listener existed; bring it in line now.
    syncRows(false);
  }
  paintExpand();

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
          description: e.tagline + " " + TIER_LABEL[e.tier] + ". The catch: " + e["catch"][0]
        };
      });
      node.textContent = JSON.stringify(data);
    } catch (err) { /* structured data is a bonus, never block the page */ }
  })();
})();
