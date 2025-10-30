
/* =============================================
   Marina Bulhosa — Portfolio Enhancements (script.js)
   Vanilla JS only • Progressive Enhancement • 2025
   Features:
   - Smooth scrolling for anchor links
   - IntersectionObserver reveal-on-scroll animations
   - Typing effect for the hero subtitle
   - Auto-created Back-to-Top button
   - Theme toggle (light/dark) with localStorage
   - Project filter (if filter buttons exist)
   - Modal image viewer (data-lightbox)
   - Copy-to-clipboard for email (data-copy-email)
   - Lazy loading helper for images
   - Basic outbound link tracking
   ============================================= */

(function () {
  "use strict";

  /* ---------------------------
     Helpers
  --------------------------- */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);
  const prefersDark = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  /* ---------------------------
     Smooth Scroll for hash links
  --------------------------- */
  $$('a[href^="#"]').forEach((link) => {
    on(link, "click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId.length > 1) {
        const target = $(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          // Update hash without instant jump
          history.pushState(null, "", targetId);
        }
      }
    });
  });

  /* ---------------------------
     Reveal-on-Scroll Animations
     Usage: add data-reveal to any element
  --------------------------- */
  const revealTargets = $$("[data-reveal], section, .project, .skills-list li");
  if ("IntersectionObserver" in window && revealTargets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => {
      el.classList.add("reveal"); // initial hidden state
      io.observe(el);
    });
  }

  /* Inject minimal CSS for reveal if not present */
  (function injectRevealCSS() {
    const styleId = "reveal-animations-style";
    if ($("#" + styleId)) return;
    const css = `
      .reveal { opacity: 0; transform: translateY(16px); transition: opacity .6s ease, transform .6s ease; }
      .reveal.reveal-in { opacity: 1; transform: translateY(0); }
    `;
    const s = document.createElement("style");
    s.id = styleId;
    s.textContent = css;
    document.head.appendChild(s);
  })();

  /* ---------------------------
     Typing Effect (header subtitle)
     Applies to the first <header> p (fallback-safe)
  --------------------------- */
  (function typingEffect() {
    const el = $("header p");
    if (!el) return;
    const full = el.textContent.trim();
    let i = 0;
    el.textContent = "";
    const cursor = document.createElement("span");
    cursor.textContent = "▋";
    cursor.setAttribute("aria-hidden", "true");
    cursor.style.marginLeft = "2px";
    const typeNext = () => {
      if (i < full.length) {
        el.textContent += full.charAt(i++);
        el.appendChild(cursor);
        setTimeout(typeNext, 35 + Math.random() * 40);
      } else {
        // Blink cursor
        setInterval(() => {
          cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
        }, 500);
      }
    };
    typeNext();
  })();

  /* ---------------------------
     Back-to-Top Button (auto)
  --------------------------- */
  (function backToTopButton() {
    const btn = document.createElement("button");
    btn.id = "backToTop";
    btn.type = "button";
    btn.setAttribute("aria-label", "Voltar ao topo");
    btn.innerHTML = "↑";
    Object.assign(btn.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "none",
      boxShadow: "0 4px 12px rgba(0,0,0,.15)",
      cursor: "pointer",
      fontSize: "18px",
      display: "none",
      zIndex: 9999,
      background: "#1e1e2f",
      color: "#fff",
    });
    document.body.appendChild(btn);
    on(window, "scroll", () => {
      btn.style.display = window.scrollY > 300 ? "grid" : "none";
    });
    on(btn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  })();

  /* ---------------------------
     Theme Toggle (light/dark)
     Creates a floating toggle; stores preference
  --------------------------- */
  (function themeToggle() {
    const key = "theme-preference";
    const applyTheme = (mode) => {
      document.documentElement.dataset.theme = mode;
      // minimal theme styles (opt-in)
      if (!$("#theme-style")) {
        const s = document.createElement("style");
        s.id = "theme-style";
        s.textContent = `
          :root[data-theme="dark"] body { background:#0f1115; color:#e6e6e6; }
          :root[data-theme="dark"] header { background:#0b0d12; }
          :root[data-theme="dark"] .project { background:#141821; box-shadow: 0 0 0 transparent; }
          :root[data-theme="dark"] section h2 { color:#e6e6e6; }
          :root[data-theme="dark"] .skills-list li { background:#0b0d12; color:#e6e6e6; }
          :root[data-theme="dark"] footer { background:#0b0d12; }
        `;
        document.head.appendChild(s);
      }
    };

    // init theme
    const saved = localStorage.getItem(key);
    const initial = saved || (prefersDark() ? "dark" : "light");
    applyTheme(initial);

    // toggle button
    const btn = document.createElement("button");
    btn.id = "themeToggle";
    btn.type = "button";
    btn.title = "Alternar tema";
    btn.textContent = initial === "dark" ? "☀️" : "🌙";
    Object.assign(btn.style, {
      position: "fixed",
      right: "16px",
      bottom: "68px",
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      border: "none",
      background: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,.15)",
      cursor: "pointer",
      zIndex: 9999,
    });
    document.body.appendChild(btn);

    on(btn, "click", () => {
      const current = document.documentElement.dataset.theme || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      btn.textContent = next === "dark" ? "☀️" : "🌙";
      localStorage.setItem(key, next);
    });
  })();

  /* ---------------------------
     Project Filter (optional)
     Requires buttons with data-filter and cards with data-tags
  --------------------------- */
  (function projectFilter() {
    const buttons = $$("[data-filter]");
    const cards = $$(".project");
    if (!buttons.length || !cards.length) return;

    const normalize = (s) => (s || "").toLowerCase().trim();
    const setActive = (btn) => {
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
    };

    const applyFilter = (tag) => {
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(",").map(normalize);
        const show = tag === "all" || tags.includes(tag);
        card.style.display = show ? "" : "none";
      });
    };

    buttons.forEach((btn) => {
      on(btn, "click", () => {
        const tag = normalize(btn.dataset.filter);
        setActive(btn);
        applyFilter(tag);
      });
    });

    // default = all
    applyFilter("all");
  })();

  /* ---------------------------
     Modal Image Viewer (data-lightbox)
  --------------------------- */
  (function lightbox() {
    const imgs = $$("img[data-lightbox]");
    if (!imgs.length) return;

    const overlay = document.createElement("div");
    overlay.id = "lightboxOverlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.85)",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "24px",
    });

    const figure = document.createElement("figure");
    const big = document.createElement("img");
    big.alt = "";
    big.style.maxWidth = "95%";
    big.style.maxHeight = "90%";
    big.style.borderRadius = "12px";
    big.style.boxShadow = "0 10px 32px rgba(0,0,0,.35)";
    figure.appendChild(big);

    overlay.appendChild(figure);
    document.body.appendChild(overlay);

    const open = (src, alt) => {
      big.src = src;
      big.alt = alt || "";
      overlay.style.display = "flex";
    };
    const close = () => (overlay.style.display = "none");

    on(overlay, "click", (e) => {
      if (e.target === overlay) close();
    });
    on(document, "keydown", (e) => {
      if (e.key === "Escape") close();
    });

    imgs.forEach((img) => {
      on(img, "click", () => open(img.src, img.alt));
      img.style.cursor = "zoom-in";
    });
  })();

  /* ---------------------------
     Copy Email to Clipboard (data-copy-email)
  --------------------------- */
  (function copyEmail() {
    const el = $('[data-copy-email], a[href^="mailto:"]');
    if (!el) return;

    on(el, "click", (e) => {
      const email =
        el.dataset.copyEmail ||
        (el.getAttribute("href") || "").replace("mailto:", "").trim();
      if (!email) return;
      e.preventDefault();
      navigator.clipboard
        .writeText(email)
        .then(() => {
          toast("E-mail copiado!");
          // fallback open default mail if wanted:
          setTimeout(() => (window.location.href = "mailto:" + email), 400);
        })
        .catch(() => toast("Não foi possível copiar o e-mail."));
    });
  })();

  /* ---------------------------
     Lazy Loading helper for images
     Add loading="lazy" to all images without it
  --------------------------- */
  $$("img:not([loading])").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });

  /* ---------------------------
     Outbound Link Tracking (console)
  --------------------------- */
  $$('a[target="_blank"]').forEach((a) => {
    on(a, "click", () => {
      // Basic, privacy-friendly console tracking
      console.log("[Outbound] ->", a.href);
    });
  });

  /* ---------------------------
     Toast utility
  --------------------------- */
  function toast(msg = "", duration = 1500) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      Object.assign(t.style, {
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        background: "#1e1e2f",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,.2)",
        zIndex: 10001,
        opacity: "0",
        transition: "opacity .25s ease, transform .25s ease",
        pointerEvents: "none",
        fontSize: "14px",
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(6px)";
    }, duration);
  }

})();
