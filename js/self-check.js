/**
 * Solo self-check: the person reviews THEIR OWN accounts.
 * Nothing is looked up or scanned. Progress is saved in localStorage only.
 */
(function () {
  "use strict";

  var DAC = window.DAC;
  var apps = window.DATING_APPS || [];
  var state = DAC.loadSelfCheck();
  var filter = "all";
  var RING_C = 2 * Math.PI * 52;

  var ICON_EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  var ICON_CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function entry(id) {
    if (!state.entries[id]) state.entries[id] = { status: "", notes: "", lastChecked: "" };
    return state.entries[id];
  }

  function $(id) { return document.getElementById(id); }

  var saveTimer;
  function persist(immediate) {
    clearTimeout(saveTimer);
    if (immediate) { DAC.saveSelfCheck(state); return; }
    saveTimer = setTimeout(function () { DAC.saveSelfCheck(state); }, 300);
  }

  function metaText(e) {
    if (!e.status) return "Not reviewed yet";
    return e.lastChecked ? "Checked " + DAC.prettyDate(e.lastChecked) : "No check date";
  }

  function matchesFilter(e) {
    if (filter === "todo") return !e.status;
    if (filter === "done") return !!e.status;
    if (filter === "active") return e.status === "active";
    return true;
  }

  /* ---------- render ---------- */
  function buildCard(app, i) {
    var e = entry(app.id);
    var card = document.createElement("article");
    card.className = "app-card";
    card.id = "app-" + app.id;
    card.dataset.appId = app.id;
    card.style.setProperty("--brand", app.color || "var(--accent)");
    card.style.animationDelay = Math.min(i * 40, 400) + "ms";

    var bodyId = "body-" + app.id;
    var h = "";
    h += '<h3 class="sr-only">' + DAC.esc(app.name) + "</h3>";
    h += '<button type="button" class="app-head" aria-expanded="false" aria-controls="' + bodyId + '">';
    h += '<span class="app-icon" aria-hidden="true">' + DAC.esc(app.icon || "💬") + "</span>";
    h += '<span class="app-title"><span class="app-name">' + DAC.esc(app.name) + '</span><span class="app-meta" data-meta>' + DAC.esc(metaText(e)) + "</span></span>";
    h += '<span data-badge>' + DAC.statusBadge(e.status) + "</span>";
    h += ICON_CHEV + "</button>";
    h += '<div class="app-body" id="' + bodyId + '" role="region" aria-label="' + DAC.esc(app.name) + ' details"><div class="app-body-inner"><div class="app-body-pad">';

    if (app.discreet && app.disclaimer) {
      h += '<div class="callout callout-warn" style="margin-top:1rem"><span class="callout-icon" aria-hidden="true">🤫</span><div><strong>Private self-review</strong><p>' + DAC.esc(app.disclaimer) + "</p></div></div>";
    }
    h += '<p class="section-label">How to check your own account</p><ol class="steps-list">';
    (app.steps || []).forEach(function (s) { h += "<li>" + DAC.esc(s) + "</li>"; });
    h += "</ol>";
    h += '<div class="app-links">';
    h += '<a class="link-chip" href="' + DAC.esc(DAC.safeUrl(app.officialUrl)) + '" target="_blank" rel="noopener noreferrer">Official site ' + ICON_EXT + '<span class="sr-only"> (opens in new tab)</span></a>';
    h += '<a class="link-chip" href="' + DAC.esc(DAC.safeUrl(app.helpUrl)) + '" target="_blank" rel="noopener noreferrer">Help &amp; account ' + ICON_EXT + '<span class="sr-only"> (opens in new tab)</span></a>';
    h += "</div>";

    h += '<fieldset><legend>Your status</legend><div class="segmented">';
    DAC.STATUS_ORDER.forEach(function (key) {
      h += '<label><input type="radio" name="status-' + app.id + '" value="' + key + '"' + (e.status === key ? " checked" : "") + "><span>" + DAC.esc(DAC.STATUS[key].label) + "</span></label>";
    });
    h += "</div></fieldset>";

    h += '<div class="two-col"><div class="field"><label for="date-' + app.id + '">Last checked</label><div class="inline-field">';
    h += '<input type="date" id="date-' + app.id + '" value="' + DAC.esc(e.lastChecked) + '" max="' + DAC.todayISO() + '">';
    h += '<button type="button" class="btn btn-sm" data-today>Today</button></div></div>';
    h += '<div class="field" style="display:flex;align-items:flex-end"><button type="button" class="btn btn-ghost btn-sm" data-reset>Reset this app</button></div></div>';
    h += '<div class="field" style="margin-bottom:0"><label for="notes-' + app.id + '">Notes <span class="hint">· private unless you export or share</span></label>';
    h += '<textarea id="notes-' + app.id + '" maxlength="1000" placeholder="e.g. Deleted on Oct 2 — confirmation email saved">' + DAC.esc(e.notes) + "</textarea></div>";
    h += "</div></div></div>";
    card.innerHTML = h;

    var head = card.querySelector(".app-head");
    head.addEventListener("click", function () { setOpen(card, !card.classList.contains("open")); });

    card.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.addEventListener("change", function () {
        e.status = r.value;
        if (!e.lastChecked) {
          e.lastChecked = DAC.todayISO();
          card.querySelector('input[type="date"]').value = e.lastChecked;
        }
        persist(true);
        refreshCard(card, true);
        refreshAll();
        DAC.toast(app.name + " · " + DAC.STATUS[r.value].label + " — saved");
      });
    });

    var dateInp = card.querySelector('input[type="date"]');
    dateInp.addEventListener("change", function () {
      e.lastChecked = dateInp.value;
      persist(true);
      refreshCard(card);
    });
    card.querySelector("[data-today]").addEventListener("click", function () {
      dateInp.value = DAC.todayISO();
      e.lastChecked = dateInp.value;
      persist(true);
      refreshCard(card);
      DAC.toast("Marked " + app.name + " checked today");
    });
    card.querySelector("[data-reset]").addEventListener("click", function () {
      state.entries[app.id] = { status: "", notes: "", lastChecked: "" };
      persist(true);
      var fresh = buildCard(app, 0);
      fresh.style.animationDelay = "0ms";
      card.replaceWith(fresh);
      setOpen(fresh, true);
      refreshAll();
      DAC.toast(app.name + " reset");
    });
    var notes = card.querySelector("textarea");
    notes.addEventListener("input", function () {
      e.notes = notes.value;
      persist(false);
      updatePreview();
    });
    notes.addEventListener("blur", function () { persist(true); });
    return card;
  }

  function setOpen(card, open) {
    card.classList.toggle("open", open);
    card.querySelector(".app-head").setAttribute("aria-expanded", open ? "true" : "false");
  }

  function refreshCard(card, pop) {
    var e = entry(card.dataset.appId);
    card.querySelector("[data-badge]").innerHTML = DAC.statusBadge(e.status, pop ? "pop" : "");
    card.querySelector("[data-meta]").textContent = metaText(e);
  }

  function renderApps() {
    var list = $("apps-list");
    list.innerHTML = "";
    apps.forEach(function (app, i) { list.appendChild(buildCard(app, i)); });
    applyFilter();
  }

  function applyFilter() {
    var shown = 0;
    document.querySelectorAll(".app-card").forEach(function (card) {
      var ok = matchesFilter(entry(card.dataset.appId));
      card.classList.toggle("hidden", !ok);
      if (ok) shown++;
    });
    $("filter-empty").classList.toggle("hidden", shown > 0);
  }

  /* ---------- progress / stats ---------- */
  function counts() {
    var c = { total: apps.length, done: 0, none: 0, active: 0, paused: 0, unsure: 0 };
    apps.forEach(function (a) {
      var s = entry(a.id).status;
      if (s) { c.done++; c[s]++; }
    });
    return c;
  }

  function setRing(svgFill, pct) {
    svgFill.style.strokeDasharray = RING_C;
    svgFill.style.strokeDashoffset = RING_C * (1 - pct / 100);
  }

  function refreshAll() {
    var c = counts();
    var pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
    setRing($("ring-fill"), pct);
    $("ring-pct").textContent = pct + "%";
    var ring = $("ring");
    ring.setAttribute("aria-valuenow", String(pct));
    ring.setAttribute("aria-valuetext", c.done + " of " + c.total + " apps reviewed");
    $("progress-title").textContent = c.done === c.total ? "All apps reviewed 🎉" : c.done + " of " + c.total + " apps reviewed";
    $("progress-sub").textContent = c.done === c.total
      ? "Export your summary or create a share package."
      : (c.total - c.done) + " left — tap an app to review it.";
    $("stat-active").textContent = c.active;
    $("stat-paused").textContent = c.paused;
    $("stat-none").textContent = c.none;
    $("stat-unsure").textContent = c.unsure;

    $("count-all").textContent = c.total;
    $("count-todo").textContent = c.total - c.done;
    $("count-done").textContent = c.done;
    $("count-active").textContent = c.active;

    var barFill = $("bar-ring-fill");
    if (barFill) {
      barFill.style.strokeDasharray = 2 * Math.PI * 18;
      barFill.style.strokeDashoffset = 2 * Math.PI * 18 * (1 - pct / 100);
      $("bar-pct").textContent = c.done + "/" + c.total;
      $("bar-title").textContent = c.done === c.total ? "All reviewed" : (c.total - c.done) + " apps left";
    }
    applyFilter();
    updatePreview();
  }

  /* ---------- export ---------- */
  function buildPayload() {
    var entries = {};
    apps.forEach(function (app) {
      var e = entry(app.id);
      entries[app.id] = {
        name: app.name,
        status: e.status || "",
        statusLabel: e.status ? DAC.STATUS[e.status].label : "Not reviewed",
        lastChecked: e.lastChecked || "",
        notes: e.notes || ""
      };
    });
    return {
      type: "dating-apps-check-self",
      version: 2,
      label: state.label || "",
      exportedAt: new Date().toISOString(),
      entries: entries
    };
  }

  function buildText() {
    var c = counts();
    var lines = [];
    lines.push("Dating Apps Check — private self-review");
    if (state.label) lines.push("Label: " + state.label);
    lines.push("Exported: " + new Date().toLocaleString());
    lines.push("Reviewed: " + c.done + " of " + c.total + " · Active " + c.active + " · Paused/deleted " + c.paused + " · No account " + c.none + " · Not sure " + c.unsure);
    lines.push("");
    apps.forEach(function (app) {
      var e = entry(app.id);
      var s = e.status ? DAC.STATUS[e.status].label : "Not reviewed";
      lines.push("• " + app.name + " — " + s + (e.lastChecked ? " (checked " + e.lastChecked + ")" : ""));
      if (e.notes) lines.push("    Notes: " + e.notes.replace(/\s*\n\s*/g, " / "));
    });
    lines.push("");
    lines.push("Self-reported by the account owner. This tool cannot see or scan any app.");
    return lines.join("\n");
  }

  function updatePreview() {
    var el = $("summary-preview");
    if (el) el.textContent = buildText();
  }

  function fileSlug() {
    return "dating-apps-self-check-" + DAC.todayISO();
  }

  /* ---------- bind ---------- */
  function bind() {
    var label = $("display-name");
    label.value = state.label || "";
    label.addEventListener("input", function () {
      state.label = label.value.slice(0, 60);
      persist(false);
      updatePreview();
    });

    document.querySelectorAll(".chip[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        filter = chip.dataset.filter;
        document.querySelectorAll(".chip[data-filter]").forEach(function (c) {
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        applyFilter();
      });
    });

    $("btn-expand-all").addEventListener("click", function () {
      document.querySelectorAll(".app-card:not(.hidden)").forEach(function (c) { setOpen(c, true); });
    });
    $("btn-collapse-all").addEventListener("click", function () {
      document.querySelectorAll(".app-card").forEach(function (c) { setOpen(c, false); });
    });
    $("btn-next").addEventListener("click", openNext);
    $("btn-clear").addEventListener("click", function () {
      if (!window.confirm("Clear all saved self-check data from this browser? This can't be undone.")) return;
      try { localStorage.removeItem(DAC.STORAGE_KEY); } catch (e) {}
      state = { label: "", entries: {}, updatedAt: null };
      label.value = "";
      renderApps();
      refreshAll();
      DAC.toast("Saved data cleared");
    });

    $("btn-copy-text").addEventListener("click", function () { DAC.copy(buildText(), "Summary copied"); });
    $("btn-copy-json").addEventListener("click", function () { DAC.copy(JSON.stringify(buildPayload(), null, 2), "JSON copied"); });
    $("btn-download-text").addEventListener("click", function () { DAC.download(fileSlug() + ".txt", buildText(), "text/plain"); });
    $("btn-download-json").addEventListener("click", function () { DAC.download(fileSlug() + ".json", JSON.stringify(buildPayload(), null, 2), "application/json"); });
    var barCopy = $("bar-copy");
    if (barCopy) barCopy.addEventListener("click", function () { DAC.copy(buildText(), "Summary copied"); });
    var barNext = $("bar-next");
    if (barNext) barNext.addEventListener("click", openNext);
  }

  function openNext() {
    var target = null;
    for (var i = 0; i < apps.length; i++) {
      if (!entry(apps[i].id).status) { target = document.getElementById("app-" + apps[i].id); break; }
    }
    if (!target) {
      $("export").scrollIntoView({ behavior: "smooth", block: "start" });
      DAC.toast("Everything's reviewed — here's your summary");
      return;
    }
    if (target.classList.contains("hidden")) {
      filter = "all";
      document.querySelectorAll(".chip[data-filter]").forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.filter === "all" ? "true" : "false"); });
      applyFilter();
    }
    setOpen(target, true);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { target.querySelector(".app-head").focus({ preventScroll: true }); }, 350);
  }

  bind();
  renderApps();
  refreshAll();
  // Deep link: self-check.html#tinder opens that app.
  function openFromHash() {
    var hash = location.hash.replace("#", "");
    var target = hash && document.getElementById("app-" + hash);
    if (target) { setOpen(target, true); setTimeout(function () { target.scrollIntoView({ block: "start" }); }, 50); }
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  DAC._selfCheck = { buildPayload: buildPayload, buildText: buildText, counts: counts };
})();
