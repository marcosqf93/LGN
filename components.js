function renderLayout() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  const brandName = "LGN Empreendimentos Imobiliários";
  const whatsapp = "5567984724138";
  const logo = "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkrC1L_rtv1sZEhVbT41xYnBIV2St6dffuMfY0mm47e6-LF36y900bGRQmuKaFwAV652DSpmV0YTU7Krqm2HdwhOfaKgJXGZdvGfH6e7ny9ldGSsk__QXy6j0tIJENsxanL9JdtzPellrmc=s680-w680-h510-rw";

  if (header) {
    header.innerHTML = `
      <header class="topbar">
        <div class="container topbar-wrap">
          <a href="/index.html" class="brand-link">
            <img class="brand" src="${logo}" alt="${brandName}" />
          </a>
          <span class="brand-wordmark desktop-only">${brandName}</span>

          <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>

          <nav class="main-nav" id="main-nav">
            <a href="/index.html#home">Início</a>
            <a href="/about.html">Quem Somos</a>
            <a href="/index.html#imoveis">Imóveis</a>
            <a href="/index.html#contato">Contato</a>
          </nav>

          <div class="social-mini">
            <a class="icon-btn whatsapp" href="https://wa.me/${whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-7.6-11.5A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8.5v.5z"/></svg></a>
          </div>
        </div>
      </header>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <div class="container footer-grid">
          <section>
            <div class="footer-brand-row">
              <img class="brand footer-brand" src="${logo}" alt="${brandName}" />
              <span class="brand-wordmark desktop-only">${brandName}</span>
            </div>
            <p>Rua Marechal Deodoro da Fonseca, 631 - Guanandy, Aquidauana - MS, 79200-000</p>
            <a class="footer-contact-line" href="https://wa.me/5567984724138" target="_blank" rel="noopener">
              <span class="footer-whatsapp-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.5 3.5A11 11 0 0 0 3.2 16.8L2 22l5.4-1.4A11 11 0 1 0 20.5 3.5zm-8.9 16.1a9 9 0 0 1-4.6-1.3l-.3-.2-3.2.8.9-3.1-.2-.3A9 9 0 1 1 11.6 19.6zm5.2-6.8c-.3-.2-1.8-.9-2-1s-.4-.2-.6.2-.7 1-.9 1.2-.3.2-.6.1a7.2 7.2 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5s0-.3 0-.5-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.3.9 2.7 1 2.9c.1.2 1.8 2.8 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.8-.7 2.1-1.3.3-.6.3-1.1.2-1.3s-.3-.2-.6-.4z"/></svg></span>
              <span>(67) 98472-4138</span>
            </a>
            <p><strong>Horário:</strong> seg a qui 09:00-11:00 / 13:00-18:00 | sex 09:00-11:00 / 13:00-18:00 | sáb e dom fechado</p>
          </section>

          <section>
            <h3>Atuamos em</h3>
            <ul class="city-list">
              <li>Aquidauana</li>
              <li>Anastácio</li>
            </ul>
          </section>

          <section>
            <h3>Como chegar</h3>
            <iframe
              class="map-frame"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Rua+Marechal+Deodoro+da+Fonseca,+631,+Guanandy,+Aquidauana+-+MS&output=embed"
              title="Mapa da Imobiliária"
            ></iframe>
          </section>
        </div>
        <div class="footer-signature">
          <span class="footer-copyright">Copyright 2026 LGN Empreendimentos Imobiliários</span>
          <a class="footer-dev-pill" href="https://wa.me/5567999638295" target="_blank" rel="noopener">
            <span class="footer-dev-pill-label">DESENVOLVIDO POR</span>
            <img src="https://i.postimg.cc/ZKhKH9RF/mf-dev-studio-horizontal-transparente.png" alt="MF Dev Studio" />
          </a>
        </div>
      </footer>
    `;
  }

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
}

renderLayout();

const PROPERTY_API_URL = "https://geraldo-gama-admin.onrender.com/api/properties?limit=500";

function updateLivePropertyCounts(total) {
  const n = Number(total) || 0;
  if (n <= 0) return;
  document.querySelectorAll("[data-live-property-count]").forEach((el) => {
    if (!el) return;
    const compact = el.getAttribute("data-live-property-count-format") === "compact";
    el.textContent = compact ? (n === 1 ? "+1" : `+${n}`) : (n === 1 ? "1 imóvel" : `+${n} imóveis`);
  });
}

(async function syncLiveCounts() {
  if (!document.querySelector("[data-live-property-count]")) return;
  try {
    const res = await fetch(PROPERTY_API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("API indisponível");
    const payload = await res.json();
    const total = Array.isArray(payload.properties) ? payload.properties.filter((item) => item && item.ativo !== false).length : 0;
    updateLivePropertyCounts(total);
  } catch {
    if (window.IMOVEIS && Array.isArray(window.IMOVEIS)) {
      if (window.IMOVEIS.length > 0) updateLivePropertyCounts(window.IMOVEIS.length);
    }
  }
})();

window.addEventListener("imoveis-ready", (event) => {
  if (typeof event?.detail?.total === "number") {
    updateLivePropertyCounts(event.detail.total);
  }
});

// scroll to top
(function () {
  const btn = document.createElement("button");
  btn.className = "scroll-top";
  btn.setAttribute("aria-label", "Voltar ao topo");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 300);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// reviews slider dots + auto-play
(function () {
  let autoTimer;
  let scrollHandler, mouseEnter, mouseLeave, touchStart, touchEnd;
  const track = document.getElementById("reviews-track");
  const dotsContainer = document.getElementById("review-dots");
  if (!track || !dotsContainer) return;

  function initSlider() {
    cleanup();
    const cards = track.querySelectorAll(".review-card");
    if (!cards.length) return;

    dotsContainer.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "review-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Avaliação " + (i + 1));
      dot.addEventListener("click", () => {
        const cardRect = cards[i].getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        track.scrollTo({ left: track.scrollLeft + cardRect.left - trackRect.left, behavior: "smooth" });
        resetAuto();
      });
      dotsContainer.appendChild(dot);
    });

    function updateDots() {
      const currentCards = track.querySelectorAll(".review-card");
      if (!currentCards.length) return;
      const step = currentCards[0].offsetWidth + 16;
      const idx = step ? Math.round(track.scrollLeft / step) : 0;
      dotsContainer.querySelectorAll(".review-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
    }

    function goNext() {
      const currentCards = track.querySelectorAll(".review-card");
      if (!currentCards.length) return;
      const step = currentCards[0].offsetWidth + 16;
      const max = track.scrollWidth - track.clientWidth;
      let next = track.scrollLeft + step;
      if (next >= max) next = 0;
      track.scrollTo({ left: next, behavior: "smooth" });
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(goNext, 4000); }
    function stopAuto() { clearInterval(autoTimer); }
    function resetAuto() { startAuto(); }

    scrollHandler = updateDots;
    mouseEnter = stopAuto;
    mouseLeave = startAuto;
    touchStart = stopAuto;
    touchEnd = startAuto;

    track.addEventListener("scroll", scrollHandler);
    track.addEventListener("mouseenter", mouseEnter);
    track.addEventListener("mouseleave", mouseLeave);
    track.addEventListener("touchstart", touchStart, { passive: true });
    track.addEventListener("touchend", touchEnd, { passive: true });

    updateDots();
    startAuto();
  }

  function cleanup() {
    clearInterval(autoTimer);
    if (track) {
      track.removeEventListener("scroll", scrollHandler);
      track.removeEventListener("mouseenter", mouseEnter);
      track.removeEventListener("mouseleave", mouseLeave);
      track.removeEventListener("touchstart", touchStart);
      track.removeEventListener("touchend", touchEnd);
    }
  }

  window.addEventListener("reviews-replaced", initSlider);
  initSlider();
})();

// live reviews from proxy, loaded on demand
(function () {
  const section = document.getElementById("avaliacoes");
  const track = document.getElementById("reviews-track");
  if (!section || !track) return;

  let loaded = false;

  async function loadLiveReviews() {
    if (loaded) return;
    loaded = true;
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.reviews || !data.reviews.length) return;
      if (data.rating && data.source === "google") {
        const ratingBadge = document.querySelector(".reviews-rating-badge") || document.createElement("div");
        ratingBadge.className = "reviews-rating-badge";
        ratingBadge.textContent = `${data.rating.toFixed(1)}/5 no Google · ${data.total} avaliações`;
        document.querySelector(".reviews-header div")?.appendChild(ratingBadge);
      }
      track.innerHTML = data.reviews
        .map(
          (r) =>
            `<article class="review-card"><div class="review-stars">${"★".repeat(Math.min(5, r.rating))}${"☆".repeat(5 - Math.min(5, r.rating))}</div><blockquote>${r.text}</blockquote><span class="review-author">— ${r.author}</span></article>`
        )
        .join("");
      document.querySelectorAll(".review-source").forEach(el => el.remove());
      const evt = new CustomEvent("reviews-replaced");
      window.dispatchEvent(evt);
    } catch {
      // proxy not available — static reviews remain
    }
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadLiveReviews();
      io.disconnect();
    }
  }, { threshold: 0.15 });

  io.observe(section);
})();

// counter animation
(function () {
  const counters = document.querySelectorAll(".counter-anim");
  if (!counters.length) return;

  function animateCounter(el, target) {
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 900;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * progress);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function run() {
    const total = Number(document.querySelectorAll("#cards .card").length || 0);
    counters.forEach((el) => {
      const base = Number(el.dataset.count || 0);
      const target = base === 80 ? Math.max(base, total) : base;
      animateCounter(el, target);
    });
  }

  const obs = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      run();
      obs.disconnect();
    }
  }, { threshold: 0.2 });

  const badgeGrid = document.querySelector(".badge-grid");
  if (badgeGrid) obs.observe(badgeGrid);
})();
