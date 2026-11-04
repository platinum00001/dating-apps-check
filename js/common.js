/**
 * Shared helpers: theme toggle, toasts, clipboard, downloads, local storage.
 * Everything runs in the browser. No network calls, no tracking.
 */
(function () {
  "use strict";

  var DAC = (window.DAC = window.DAC || {});
  DAC.STORAGE_KEY = "datingAppsCheck_selfCheck_v1";
  DAC.THEME_KEY = "dac-theme";
  DAC.STATUS = {
    none: { label: "No account", tone: "t-none", icon: "∅" },
    active: { label: "Active", tone: "t-active", icon: "●" },
    paused: { label: "Paused or deleted", tone: "t-paused", icon: "⏸" },
    unsure: { label: "Not sure", tone: "t-unsure", icon: "?" }
  };
  DAC.STATUS_ORDER = ["none", "active", "paused", "unsure"];

  DAC.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  DAC.safeUrl = function (u) {
    return /^https:\/\//i.test(String(u || "")) ? String(u) : "#";
  };

  DAC.todayISO = function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };

  DAC.prettyDate = function (iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "";
    var p = iso.slice(0, 10).split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  DAC.statusBadge = function (status, extraClass) {
    var s = DAC.STATUS[status];
    var label = s ? s.label : "Not reviewed";
    var tone = s ? s.tone : "t-empty";
    return '<span class="badge ' + tone + (extraClass ? " " + extraClass : "") + '">' + DAC.esc(label) + "</span>";
  };

  DAC.appById = function (id) {
    var list = window.DATING_APPS || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  /* ---------- storage ---------- */
  DAC.loadSelfCheck = function () {
    var empty = { label: "", entries: {}, updatedAt: null };
    try {
      var raw = localStorage.getItem(DAC.STORAGE_KEY);
      if (!raw) return empty;
      var p = JSON.parse(raw);
      if (!p || typeof p !== "object") return empty;
      var entries = {};
      var src = p.entries && typeof p.entries === "object" ? p.entries : {};
      Object.keys(src).forEach(function (id) {
        var e = src[id] || {};
        entries[id] = {
          status: DAC.STATUS[e.status] ? e.status : "",
          notes: typeof e.notes === "string" ? e.notes : "",
          lastChecked: typeof e.lastChecked === "string" ? e.lastChecked : ""
        };
      });
      return { label: typeof p.label === "string" ? p.label : "", entries: entries, updatedAt: p.updatedAt || null };
    } catch (e) {
      return empty;
    }
  };

  DAC.saveSelfCheck = function (state) {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(DAC.STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      DAC.toast("Couldn't save — browser storage is blocked or full", "error");
      return false;
    }
  };

  /* ---------- toasts ---------- */
  DAC.toast = function (msg, kind) {
    var stack = document.getElementById("toasts");
    if (!stack) return;
    var t = document.createElement("div");
    t.className = "toast" + (kind === "error" ? " error" : "");
    t.setAttribute("role", kind === "error" ? "alert" : "status");
    t.innerHTML = '<span class="t-ico" aria-hidden="true">' + (kind === "error" ? "!" : "✓") + "</span><span></span>";
    t.lastChild.textContent = msg;
    stack.appendChild(t);
    while (stack.children.length > 3) stack.removeChild(stack.firstChild);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, 2400);
  };

  /* ---------- clipboard / download ---------- */
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  DAC.copy = function (text, okMsg) {
    var done = function () { DAC.toast(okMsg || "Copied to clipboard"); };
    var fail = function () {
      if (fallbackCopy(text)) done();
      else DAC.toast("Copy blocked — select the text and copy manually", "error");
    };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fail);
    } else {
      fail();
    }
  };

  DAC.download = function (filename, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    DAC.toast("Downloaded " + filename);
  };

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0b0a14" : "#f7f6fb");
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btns[i].setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    }
  }

  function initTheme() {
    var t = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(t);
    var btns = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(DAC.THEME_KEY, next); } catch (e) {}
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTheme);
  else initTheme();
})();
