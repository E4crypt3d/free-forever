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

  function srcLinks(entry) {
    return (entry.sources || []).map(function (key) {
      var url = window.SOURCES[key];
      if (!url) return "";
      var name = key;
      if (key.indexOf(entry.id + "-") === 0) name = key.slice(entry.id.length + 1);
      else if (key !== entry.id) name = key;
      else name = "site";
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(name) + "</a>";
    }).join("");
  }

  function card(e) {
    var tags = [
      '<span class="tag tag--' + esc(e.tier) + '">' + esc(TIER_LABEL[e.tier]) + "</span>",
      e.pick ? '<span class="tag tag--pick">top pick</span>' : "",
      '<span class="tag tag--plain">' + esc(CAT_LABEL[e.category] || e.category) + "</span>",
      e.how !== "none" ? '<span class="tag tag--plain">' + esc(HOW_LABEL[e.how] || e.how) + "</span>" : ""
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
          '<span class="drow-host">' + esc(host(e.url)) + "</span>",
          '<span class="drow-cat">' + esc(CAT_LABEL[e.category] || e.category) +
            (e.how !== "none" ? ' <i>·</i> ' + esc(HOW_LABEL[e.how]) : "") + "</span>",
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
          '<span class="drow-src">' + (e.evidence === "vendor" ? "vendor page" : "directory") + "</span>",
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

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value.trim().toLowerCase();
    apply();
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "/" && document.activeElement !== searchEl) {
      ev.preventDefault();
      searchEl.focus();
    }
  });

  apply();
})();
