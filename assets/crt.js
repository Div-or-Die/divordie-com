/* divordie.com — matrix rain + entry gate */
(function () {
  "use strict";

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- matrix rain ---------------- */

  function rain() {
    var cv = document.getElementById("rain");
    if (!cv || reduced) return;

    var ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    var glyphs = "01ABCDEF<>[]{}/\\|=+*#$%&HEXMERGE".split("");
    var size = 15;
    var cols = 0;
    var drops = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      cv.width = Math.floor(window.innerWidth * dpr);
      cv.height = Math.floor(window.innerHeight * dpr);
      cv.style.width = window.innerWidth + "px";
      cv.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / size);
      drops = new Array(cols);
      for (var i = 0; i < cols; i++) {
        drops[i] = Math.random() * -100;
      }
    }

    var last = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (now - last < 55) return;
      last = now;

      ctx.fillStyle = "rgba(5, 5, 5, 0.075)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = size + "px 'Share Tech Mono', monospace";

      for (var i = 0; i < cols; i++) {
        var ch = glyphs[(Math.random() * glyphs.length) | 0];
        var y = drops[i] * size;

        // bright head with phosphor bloom, dimmer tail behind it
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ccffd8";
        ctx.fillText(ch, i * size, y);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#00ff41";
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, y - size);

        if (y > window.innerHeight && Math.random() > 0.977) drops[i] = 0;
        drops[i]++;
      }
    }

    resize();
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(resize, 180);
    });
    requestAnimationFrame(frame);
  }

  /* ---------------- entry gate ---------------- */

  function gate() {
    var el = document.getElementById("gate");
    if (!el) return;

    // ?nogate=1 skips it; ?gate=1 forces it even on a repeat visit.
    var qs = window.location.search;
    var force = qs.indexOf("gate=1") > -1 && qs.indexOf("nogate=1") === -1;
    var skip = qs.indexOf("nogate=1") > -1;

    var seen = false;
    try { seen = sessionStorage.getItem("dod.entered") === "1"; } catch (e) {}

    if (skip || (!force && (reduced || seen))) {
      el.parentNode.removeChild(el);
      return;
    }

    el.hidden = false;
    document.body.classList.add("gated");
    document.body.style.overflow = "hidden";

    var boot = el.querySelector(".gate-boot");
    var lines = [
      "[SYSTEM] Initializing DIV.OR.DIE protocol...",
      "[SYSTEM] Matrix connection established.",
      "[ OK ] 2 operators online.",
      "[ OK ] Awaiting authorization."
    ];

    if (boot) {
      var i = 0;
      (function next() {
        if (i >= lines.length || el.dataset.done === "1") return;
        var d = document.createElement("div");
        d.textContent = lines[i];
        boot.appendChild(d);
        i++;
        setTimeout(next, 330);
      })();
    }

    function enter() {
      if (el.dataset.done === "1") return;
      el.dataset.done = "1";
      try { sessionStorage.setItem("dod.entered", "1"); } catch (e) {}
      document.body.classList.remove("gated");
      document.body.style.overflow = "";
      el.style.transition = "opacity .28s ease";
      el.style.opacity = "0";
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        var h = document.querySelector("h1");
        if (h) h.setAttribute("tabindex", "-1"), h.focus({ preventScroll: true });
      }, 290);
    }

    el.addEventListener("click", enter);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        enter();
      }
    });
    // Any key anywhere dismisses it.
    document.addEventListener("keydown", function once(e) {
      if (el.dataset.done === "1") { document.removeEventListener("keydown", once); return; }
      enter();
      document.removeEventListener("keydown", once);
    });

    el.focus({ preventScroll: true });
  }

  function init() { rain(); gate(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
