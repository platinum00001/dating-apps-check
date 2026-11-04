/**
 * Mutual opt-in: each person creates a share package from THEIR OWN self-check.
 * Two packages are compared side by side, entirely in this browser.
 */
(function () {
  "use strict";

  var DAC = window.DAC;
  var apps = window.DATING_APPS || [];
  var PREFIX = "DAC1:";
  var MAX_LEN = 200000;
  var current = null;

  function $(id) { return document.getElementById(id); }

  /* ---------- encode / decode ---------- */
  function encode(pkg) {
    var json = JSON.stringify(pkg);
    var bytes = new TextEncoder().encode(json);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return PREFIX + btoa(bin);
  }

  function decodeB64(b64) {
    var bin = atob(b64.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/"));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function parsePackage(text) {
    var t = String(text || "").trim();
    if (!t) throw new Error("Paste a share package here.");
    if (t.length > MAX_LEN) throw new Error("That's too large to be a share package.");
    var m = t.match(/#pkg=([^\s]+)/);
    if (m) t = decodeURIComponent(m[1]);
    var obj;
    try {
      if (t.indexOf(PREFIX) === 0) obj = JSON.parse(decodeB64(t.slice(PREFIX.length)));
      else obj = JSON.parse(t);
    } catch (e) {
      throw new Error("Couldn't read this — paste the full code starting with DAC1: or the JSON file contents.");
    }
    if (!obj || typeof obj !== "object" || !obj.entries || typeof obj.entries !== "object") {
      throw new Error("This doesn't look like a Dating Apps Check package.");
    }
    var entries = {};
    Object.keys(obj.entries).slice(0, 60).forEach(function (id) {
      var e = obj.entries[id] || {};
      entries[String(id).slice(0, 60)] = {
        name: String(e.name || (DAC.appById(id) || {}).name || id).slice(0, 60),
        status: DAC.STATUS[e.status] ? e.status : "",
        lastChecked: typeof e.lastChecked === "string" ? e.lastChecked.slice(0, 20) : "",
        notes: typeof e.notes === "string" ? e.notes.slice(0, 1000) : ""
      };
    });
    return {
      displayName: String(obj.displayName || obj.label || "").slice(0, 60),
      sharedAt: String(obj.sharedAt || obj.exportedAt || obj.createdAt || "").slice(0, 40),
      entries: entries
    };
  }

  function buildPackage(name, includeNotes) {
    var saved = DAC.loadSelfCheck();
    var entries = {};
    apps.forEach(function (app) {
      var e = saved.entries[app.id] || {};
      var out = { name: app.name, status: e.status || "", lastChecked: e.lastChecked || "" };
      if (includeNotes && e.notes) out.notes = e.notes;
      entries[app.id] = out;
    });
    return {
      type: "dating-apps-check-share",
      version: 2,
      displayName: (name || saved.label || "").trim().slice(0, 60),
      sharedAt: new Date().toISOString(),
      entries: entries
    };
  }

  function reviewedCount(saved) {
    var n = 0;
    Object.keys(saved.entries || {}).forEach(function (k) { if (saved.entries[k].status) n++; });
    return n;
  }

  /* ---------- step 1: generate ---------- */
  function generate() {
    var saved = DAC.loadSelfCheck();
    var n = reviewedCount(saved);
    if (!n) {
      $("gen-status").innerHTML = 'You haven\'t reviewed any apps in this browser yet. <a href="self-check.html">Do your self-check first →</a>';
      DAC.toast("Complete your self-check first", "error");
      return;
    }
    current = buildPackage($("share-label").value, $("include-notes").checked);
    var code = encode(current);
    $("my-package").value = code;
    $("my-package-wrap").classList.remove("hidden");
    ["btn-copy-package", "btn-copy-link", "btn-download-package", "btn-use-mine"].forEach(function (id) { $(id).disabled = false; });
    $("gen-status").textContent = "Ready — " + n + " of " + apps.length + " apps included" + ($("include-notes").checked ? " with notes" : " (notes left out)") + ". Share only with someone who agreed to swap.";
    DAC.toast("Share package created");
  }

  function shareLink() {
    var base = location.origin && location.origin !== "null" ? location.origin + location.pathname : "mutual.html";
    return base + "#pkg=" + encodeURIComponent(encode(current));
  }

  /* ---------- step 2: compare ---------- */
  function updateBar() {
    var bar = $("action-bar");
    if (!bar) return;
    var ready = $("paste-a").classList.contains("ok") && $("paste-b").classList.contains("ok") && $("compare-results").classList.contains("hidden");
    bar.classList.toggle("is-hidden", !ready);
  }

  function validateBox(which) {
    var r = validateBoxInner(which);
    updateBar();
    return r;
  }

  function validateBoxInner(which) {
    var ta = $("package-" + which);
    var card = $("paste-" + which);
    var status = $("paste-status-" + which);
    if (!ta.value.trim()) {
      card.classList.remove("ok", "err");
      status.textContent = "";
      return null;
    }
    try {
      var p = parsePackage(ta.value);
      card.classList.add("ok");
      card.classList.remove("err");
      var n = Object.keys(p.entries).filter(function (k) { return p.entries[k].status; }).length;
      status.textContent = "✓ " + (p.displayName || "Unnamed") + " · " + n + " apps reviewed";
      return p;
    } catch (e) {
      card.classList.add("err");
      card.classList.remove("ok");
      status.textContent = e.message;
      return null;
    }
  }

  function initial(name, fallback) {
    var c = (name || "").trim().charAt(0);
    return DAC.esc(c ? c.toUpperCase() : fallback);
  }

  function cell(who, e) {
    var h = '<div class="cmp-cell"><span class="who">' + DAC.esc(who) + "</span>" + DAC.statusBadge(e ? e.status : "");
    if (e && e.lastChecked) h += "<small>Checked " + DAC.esc(DAC.prettyDate(e.lastChecked)) + "</small>";
    if (e && e.notes) h += "<small>“" + DAC.esc(e.notes) + "”</small>";
    return h + "</div>";
  }

  function sharedText(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d)) return "Self-reported";
    return "Shared " + d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function compare() {
    var a, b;
    try { a = parsePackage($("package-a").value); }
    catch (e) { validateBox("a"); DAC.toast("Person A: " + e.message, "error"); $("package-a").focus(); return; }
    try { b = parsePackage($("package-b").value); }
    catch (e) { validateBox("b"); DAC.toast("Person B: " + e.message, "error"); $("package-b").focus(); return; }
    validateBox("a"); validateBox("b");

    var nameA = a.displayName || "Person A";
    var nameB = b.displayName || "Person B";
    var ids = apps.map(function (x) { return x.id; });
    [a, b].forEach(function (p) { Object.keys(p.entries).forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); }); });

    var tally = { match: 0, diff: 0, partial: 0, activeA: 0, activeB: 0 };
    var rows = "";
    ids.forEach(function (id, i) {
      var ea = a.entries[id], eb = b.entries[id];
      var sa = ea ? ea.status : "", sb = eb ? eb.status : "";
      if (sa === "active") tally.activeA++;
      if (sb === "active") tally.activeB++;
      var kind, label;
      if (!sa || !sb) { kind = "partial"; label = "Incomplete"; }
      else if (sa === sb) { kind = "match"; label = "Matched"; }
      else { kind = "diff"; label = "Different"; }
      tally[kind]++;
      var app = DAC.appById(id) || {};
      var name = app.name || (ea && ea.name) || (eb && eb.name) || id;
      var resultBadge = '<span class="badge m-' + kind + '">' + label + "</span>";
      rows += '<div class="cmp-row ' + kind + '" style="--brand:' + DAC.esc(app.color || "var(--accent)") + ";animation-delay:" + Math.min(i * 35, 400) + 'ms">';
      rows += '<div class="cmp-app"><span class="app-icon" aria-hidden="true">' + DAC.esc(app.icon || "💬") + "</span><span>" + DAC.esc(name) + "</span>" + resultBadge + "</div>";
      rows += cell(nameA, ea) + cell(nameB, eb);
      rows += '<div class="cmp-result">' + resultBadge + "</div></div>";
    });

    $("cmp-a-avatar").innerHTML = initial(a.displayName, "A");
    $("cmp-b-avatar").innerHTML = initial(b.displayName, "B");
    $("cmp-a-name").textContent = nameA;
    $("cmp-b-name").textContent = nameB;
    $("cmp-a-meta").textContent = sharedText(a.sharedAt);
    $("cmp-b-meta").textContent = sharedText(b.sharedAt);
    $("cmp-pills").innerHTML =
      '<span class="badge m-match">' + tally.match + " matched</span>" +
      '<span class="badge m-diff">' + tally.diff + " different</span>" +
      '<span class="badge m-partial">' + tally.partial + " incomplete</span>" +
      '<span class="badge t-active">' + tally.activeA + " / " + tally.activeB + " active</span>";
    $("cmp-list").innerHTML = rows;
    $("compare-empty").classList.add("hidden");
    $("compare-results").classList.remove("hidden");
    updateBar();
    if (JSON.stringify(a.entries) === JSON.stringify(b.entries) && a.displayName === b.displayName) {
      DAC.toast("Heads up: both packages look identical", "error");
    } else {
      DAC.toast("Comparison ready");
    }
    $("compare-results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearCompare() {
    ["a", "b"].forEach(function (w) { $("package-" + w).value = ""; validateBox(w); });
    $("compare-results").classList.add("hidden");
    $("compare-empty").classList.remove("hidden");
    $("cmp-list").innerHTML = "";
    updateBar();
    DAC.toast("Cleared");
  }

  function sample(name, statuses) {
    var entries = {};
    apps.forEach(function (app, i) {
      entries[app.id] = { name: app.name, status: statuses[i] || "", lastChecked: statuses[i] ? DAC.todayISO() : "" };
    });
    return encode({ type: "dating-apps-check-share", version: 2, displayName: name, sharedAt: new Date().toISOString(), entries: entries });
  }

  function loadDemo() {
    $("package-a").value = sample("Sample: Alex", ["paused", "none", "paused", "none", "none", "none", "none", "none", "none", "none", "none"]);
    $("package-b").value = sample("Sample: Sam", ["paused", "active", "none", "none", "none", "unsure", "none", "none", "none", "", "none"]);
    validateBox("a"); validateBox("b");
    DAC.toast("Sample packages loaded (fictional)");
  }

  function readFile(input, which) {
    var f = input.files && input.files[0];
    if (!f) return;
    if (f.size > MAX_LEN) { DAC.toast("File is too large", "error"); return; }
    var r = new FileReader();
    r.onload = function () {
      $("package-" + which).value = String(r.result || "");
      if (validateBox(which)) DAC.toast("Loaded " + f.name);
      input.value = "";
    };
    r.readAsText(f);
  }

  /* ---------- bind ---------- */
  function bind() {
    var saved = DAC.loadSelfCheck();
    if (saved.label) $("share-label").value = saved.label;
    var n = reviewedCount(saved);
    $("self-summary").textContent = n
      ? "Your self-check in this browser: " + n + " of " + apps.length + " apps reviewed."
      : "No self-check saved in this browser yet.";

    $("btn-gen-package").addEventListener("click", generate);
    $("btn-copy-package").addEventListener("click", function () { if (current) DAC.copy($("my-package").value, "Share code copied"); });
    $("btn-copy-link").addEventListener("click", function () { if (current) DAC.copy(shareLink(), "Share link copied"); });
    $("btn-download-package").addEventListener("click", function () {
      if (!current) return;
      var slug = (current.displayName || "share").replace(/[^\w\-]+/g, "_").slice(0, 40);
      DAC.download("dating-apps-share-" + slug + ".json", JSON.stringify(current, null, 2), "application/json");
    });
    $("btn-use-mine").addEventListener("click", function () {
      if (!current) return;
      $("package-a").value = $("my-package").value;
      validateBox("a");
      DAC.toast("Your package added as Person A");
      $("package-b").focus();
    });
    ["a", "b"].forEach(function (w) {
      $("package-" + w).addEventListener("input", function () { validateBox(w); });
      $("file-" + w).addEventListener("change", function () { readFile($("file-" + w), w); });
    });
    $("btn-compare").addEventListener("click", compare);
    $("btn-clear-compare").addEventListener("click", clearCompare);
    $("btn-demo").addEventListener("click", loadDemo);
    var barCompare = $("bar-compare");
    if (barCompare) barCompare.addEventListener("click", compare);

    // A link like mutual.html#pkg=DAC1:... pre-fills Person B (the sender's package).
    var m = location.hash.match(/^#pkg=(.+)$/);
    if (m) {
      try {
        $("package-b").value = decodeURIComponent(m[1]);
        if (validateBox("b")) DAC.toast("Their package was loaded from the link");
      } catch (e) {}
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  bind();
  DAC._mutual = { encode: encode, parsePackage: parsePackage, buildPackage: buildPackage, compare: compare };
})();
