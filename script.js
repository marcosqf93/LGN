const API_URL = "https://lgn-admin-80oh.onrender.com/api/properties?limit=500";

function formatMoney(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function parseCurrency(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").trim();
  return parseFloat(cleaned) || 0;
}

function inferBairroFromEndereco(endereco) {
  const raw = String(endereco || "").trim();
  if (!raw) return "";
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1].replace(/^B\.?\s*/i, "");
  const tail = raw.split(/\s+/).slice(-2).join(" ");
  return tail || raw;
}

function normalizeProperty(item, extra = {}) {
  const photos = extra.fotos || (Array.isArray(item.imagens) && item.imagens.length ? item.imagens : item.imagem ? [item.imagem] : []);
  return {
    _id: item._id || "",
    referencia: String(item.referencia || ""),
    tipo: item.tipo || "",
    finalidade: item.finalidade || "",
    cidade: extra.cidade || item.cidade || "",
    bairro: extra.bairro || item.bairro || inferBairroFromEndereco(extra.endereco || item.endereco || item.bairro || ""),
    endereco: extra.endereco || item.endereco || item.bairro || "",
    mapaUrl: extra.mapaUrl || item.mapaUrl || "",
    fotos: photos,
    imagem: photos[0] || "",
    dormitorios: Number(item.dormitorios || 0),
    suites: Number(item.suites || 0),
    salas: Number(item.salas || 0),
    cozinhas: Number(item.cozinhas || 0),
    banheiros: Number(item.banheiros || 0),
    varandas: Number(item.varandas || 0),
    vagas: Number(item.vagas ?? item.garagens ?? 0),
    garagens: Number(item.garagens ?? item.vagas ?? 0),
    areaGourmet: Number(item.areaGourmet || 0),
    areaServico: Number(item.areaServico || 0),
    copa: Number(item.copa || 0),
    areaTotal: Number(item.areaTotal ?? item.metragem ?? 0),
    areaConstruida: Number(item.areaConstruida ?? item.metragem ?? 0),
    area: extra.area || item.area || (item.areaTotal || item.areaConstruida || item.metragem ? `${item.areaTotal || item.areaConstruida || item.metragem} m²` : ""),
    metragem: Number(item.metragem || item.areaTotal || item.areaConstruida || 0),
    venda: item.venda || formatMoney(item.valorVenda),
    locacao: item.locacao || formatMoney(item.valorLocacao),
    destaque: Boolean(item.destaque ?? extra.destaque),
    descricao: item.descricao || "",
    ativo: item.ativo !== false,
  };
}

function refKey(value) {
  const raw = String(value ?? "").trim();
  const numeric = raw.replace(/^0+(\d)$/, "$1");
  return { raw, numeric };
}

function isCloudinaryUrl(url) {
  return typeof url === "string" && /res\.cloudinary\.com/.test(url) && /\/upload\//.test(url);
}

function cloudinaryVariant(url, width, height) {
  if (!isCloudinaryUrl(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`);
}

function responsiveImageAttrs(url, alt, options = {}) {
  const { width, height, sizes, loading = "lazy", fetchpriority } = options;
  const parts = [`src="${isCloudinaryUrl(url) ? cloudinaryVariant(url, width || 800, height || 600) : url}"`, `alt="${alt}"`];

  if (isCloudinaryUrl(url)) {
    const srcset = [400, 800, 1200]
      .map((w) => `${cloudinaryVariant(url, w, Math.round((height || 600) * (w / (width || 800))))} ${w}w`)
      .join(", ");
    parts.push(`srcset="${srcset}"`);
    if (sizes) parts.push(`sizes="${sizes}"`);
  }

  if (width) parts.push(`width="${width}"`);
  if (height) parts.push(`height="${height}"`);
  if (loading) parts.push(`loading="${loading}"`);
  if (fetchpriority) parts.push(`fetchpriority="${fetchpriority}"`);
  return parts.join(" ");
}

const baseImoveis = typeof IMOVEIS !== "undefined" ? IMOVEIS : [];

const fallbackImoveis = baseImoveis.map((item) => {
  const extra = (typeof IMOVEIS_ENRICHMENT !== "undefined" && IMOVEIS_ENRICHMENT[item.referencia]) || {};
  return normalizeProperty({
    ...item,
    imagens: [item.imagem],
    imagensFallback: [item.imagem],
  }, extra);
});

let imoveis = fallbackImoveis;

const q = document.getElementById("hero-q");
const finalidade = document.getElementById("hero-finalidade");
const tipo = document.getElementById("hero-tipo");
const cidade = document.getElementById("hero-cidade");
const bairro = document.getElementById("hero-bairro");
const bairroTexto = document.getElementById("hero-bairro-texto");
const valorMin = document.getElementById("hero-valor-min");
const valorMax = document.getElementById("hero-valor-max");
const heroQuartos = document.getElementById("hero-quartos");
const heroSuites = document.getElementById("hero-suites");
const heroVagas = document.getElementById("hero-vagas");
const heroCodigo = document.getElementById("hero-codigo");
const heroSearchPreview = document.getElementById("hero-search-preview");
const activeFilterChips = document.getElementById("active-filter-chips");
const heroShowcaseMain = document.getElementById("hero-showcase-main");
const heroShowcaseStrip = document.getElementById("hero-showcase-strip");
const mobileFilterTrigger = document.getElementById("mobile-filter-trigger");
const mobileFilterBackdrop = document.getElementById("mobile-filter-backdrop");
const mobileFilterSheet = document.getElementById("mobile-filter-sheet");
const mobileFilterClose = document.getElementById("mobile-filter-close");
const mobileFilterApply = document.getElementById("mobile-filter-apply");
const mobileFilterQ = document.getElementById("mobile-filter-q");
const mobileFilterFinalidade = document.getElementById("mobile-filter-finalidade");
const mobileFilterTipo = document.getElementById("mobile-filter-tipo");
const mobileFilterCidade = document.getElementById("mobile-filter-cidade");
const mobileFilterValor = document.getElementById("mobile-filter-valor");
const mobileFilterQuartos = document.getElementById("mobile-filter-quartos");
const mobileFilterBairro = document.getElementById("mobile-filter-bairro");
const heroSearchCard = document.querySelector(".hero-search-card");
const heroSearchGrid = document.querySelector(".hero-search-grid");
const heroMoreFilters = document.querySelector(".hero-more-filters");
const heroMoreGrid = document.querySelector(".hero-more-grid");
const heroSearchMobileMQ = window.matchMedia("(max-width: 900px)");
const cards = document.getElementById("cards");
const stats = document.getElementById("stats");
const loadMore = document.getElementById("load-more");
const trustCount = document.querySelector('[data-trust="count"] strong');
let visibleCount = window.matchMedia && window.matchMedia("(max-width: 900px)").matches ? 6 : 12;
let filtroFinalidade = "";
let categoriaFiltro = "";
let filtroQuartos = "";
let filtroVagas = "";
let filtroBairro = "";
let filtroCodigo = "";
const FILTER_STORAGE_KEY = "lgn.homeFilters";
let filtersRestored = false;

function updateTrustCount(total) {
  if (!trustCount) return;
  const n = Number(total) || 0;
  trustCount.textContent = n === 1 ? "1 imóvel" : `${n} imóveis`;
}

function pluralize(value, singular, plural) {
  const n = Number(value) || 0;
  if (!n) return "";
  return `${n} ${n === 1 ? singular : plural}`;
}

function propertyFeatureList(item) {
  const features = [];
  const push = (label) => { if (label) features.push(label); };
  push(pluralize(item.suites, "Suíte", "Suítes"));
  push(pluralize(item.dormitorios, "Dormitório", "Dormitórios"));
  push(pluralize(item.banheiros, "Banheiro", "Banheiros"));
  push(pluralize(item.salas, "Sala", "Salas"));
  push(pluralize(item.cozinhas, "Cozinha", "Cozinhas"));
  push(pluralize(item.varandas, "Varanda", "Varandas"));
  push(pluralize(item.garagens || item.vagas, "Garagem", "Garagens"));
  push(item.areaGourmet ? "Área gourmet" : "");
  push(item.areaServico ? "Área de serviço" : "");
  push(item.copa ? "Copa" : "");
  if (item.metragem) push(`${item.metragem} m²`);
  return features.filter(Boolean);
}

function featureIcon(type) {
  const icons = {
    suites: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18v8H3z"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/></svg>',
    dormitorios: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11h18v7H3z"/><path d="M5 11V8h6a3 3 0 0 1 3 3"/></svg>',
    banheiros: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7V5a2 2 0 0 1 2-2h4"/><path d="M5 10h14a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M8 14l-1 6h10l-1-6"/></svg>',
    salas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v8H4z"/><path d="M7 10V7h10v3"/></svg>',
    cozinhas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v9H4z"/><path d="M7 9V5h10v4"/><path d="M8 13h2M12 13h2M16 13h2"/></svg>',
    areaGourmet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V9l6-4 6 4v11"/><path d="M9 20v-5h6v5"/></svg>',
    areaServico: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M8 7V4h8v3"/><path d="M8 12h8"/></svg>',
    copa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V5z"/><path d="M19 8h2a2 2 0 0 1 0 4h-2"/></svg>',
    varandas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/><path d="M6 12V6h12v6"/><path d="M7 20h10"/></svg>',
    vagas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10"/><path d="M8 19v-4h8v4"/></svg>',
    metragem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V6"/><path d="M6 6h10"/><path d="M16 6v10"/></svg>',
  };
  return icons[type] || icons.dormitorios;
}

function propertyFeatureEntries(item) {
  return [
    { key: "suites", label: "Suíte", value: item.suites },
    { key: "dormitorios", label: "Dormitório", value: item.dormitorios },
    { key: "banheiros", label: "Banheiro", value: item.banheiros },
    { key: "salas", label: "Sala", value: item.salas },
    { key: "cozinhas", label: "Cozinha", value: item.cozinhas },
    { key: "areaGourmet", label: "Área gourmet", value: item.areaGourmet },
    { key: "areaServico", label: "Área de serviço", value: item.areaServico },
    { key: "copa", label: "Copa", value: item.copa },
  ].filter((entry) => Number(entry.value) > 0);
}

function renderFeatureIcons(item, limit = 4) {
  const entries = propertyFeatureEntries(item).slice(0, limit);
  if (!entries.length) return "";
  return `<div class="feature-icons">${entries.map((entry) => {
    const count = Number(entry.value) || 0;
    return `<span class="feature-icon" title="${count} ${entry.label}${count > 1 ? 's' : ''}" aria-label="${count} ${entry.label}${count > 1 ? 's' : ''}">${featureIcon(entry.key)}${count > 1 ? `<strong>${count}</strong>` : ""}</span>`;
  }).join("")}</div>`;
}

function iconSvg(name) {
  const icons = {
    city: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l4-2v14"/><path d="M8 20V5l5-2v17"/><path d="M13 20v-9l7-3v12"/></svg>',
    bairro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5 6-11a6 6 0 0 0-12 0c0 6 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
  };
  return icons[name] || icons.city;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderLocationInfo(item) {
  const city = String(item.cidade || "").trim();
  const bairroValue = String(item.bairro || "").trim();
  const parts = [];
  if (city) parts.push(`<span class="card-location"><span class="card-location-icon">${iconSvg("city")}</span><span>${escapeHtml(city)}</span></span>`);
  if (bairroValue) parts.push(`<span class="card-location"><span class="card-location-icon">${iconSvg("bairro")}</span><span>${escapeHtml(bairroValue)}</span></span>`);
  return parts.length ? `<div class="card-location-row">${parts.join("")}</div>` : "";
}

function renderPriceLine(item) {
  const venda = String(item.venda || "").trim();
  const locacao = String(item.locacao || "").trim();
  const vendaValida = venda && venda !== "Consultar" && parseCurrency(venda) > 0;
  const locacaoValida = locacao && locacao !== "Consultar" && parseCurrency(locacao) > 0;
  if (locacaoValida && (!vendaValida || item.finalidade === "aluguel")) return `<p class="price-line price-line-rent">Locação: ${escapeHtml(locacao)}</p>`;
  if (vendaValida && locacaoValida) return `<p class="price-line">Venda: ${escapeHtml(venda)} | Locação: ${escapeHtml(locacao)}</p>`;
  if (vendaValida) return `<p class="price-line">Venda: ${escapeHtml(venda)}</p>`;
  if (locacaoValida) return `<p class="price-line price-line-rent">Locação: ${escapeHtml(locacao)}</p>`;
  return "";
}

function buildInterestMessage(item) {
  const ref = String(item.referencia || item._id || "").trim();
  const bairroValue = String(item.bairro || "").trim();
  let message = `Olá! Tenho interesse no imóvel ${ref ? `(código ${ref})` : ""}`.trim();
  if (bairroValue) message += `, localizado no Bairro ${bairroValue}`;
  message += `. Gostaria de receber mais informações e verificar disponibilidade para visita.`;
  return encodeURIComponent(message);
}

function isHeroResidential(type) {
  const t = normalizeText(type);
  return t.includes("casa") || t.includes("apartamento") || t.includes("sobrado") || t.includes("flat") || t.includes("kitnet") || t.includes("cobertura");
}

function buildHeroShowcase(items) {
  if (!heroShowcaseMain || !heroShowcaseStrip) return;
  const picks = [...(items || [])].filter(Boolean).sort((a, b) => Number(isHeroResidential(b.tipo)) - Number(isHeroResidential(a.tipo)));
  if (!picks.length) {
    heroShowcaseMain.innerHTML = "";
    heroShowcaseStrip.innerHTML = "";
    return;
  }

  const state = { index: 0 };

  function reorderToFront(nextIndex) {
    if (!Number.isInteger(nextIndex) || nextIndex <= 0 || nextIndex >= picks.length) return;
    const selected = picks.splice(nextIndex, 1)[0];
    if (!selected) return;
    picks.unshift(selected);
    state.index = 0;
    renderStrip();
    renderMain();
  }

  const mapsUrlForItem = (item) => {
    if (item.mapaUrl) return item.mapaUrl;
    const query = [item.endereco, item.bairro, item.cidade, "MS", "Brasil"]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || `${item.cidade || "Aquidauana"}, MS, Brasil`)}`;
  };

  const renderMain = () => {
    const item = picks[state.index] || picks[0];
    if (!item) return;
    const city = escapeHtml(item.cidade || "Aquidauana");
    const bairroLabel = escapeHtml(item.bairro || "");
    const price = renderPriceLine(item).replace(/<\/?.*?>/g, "").replace(/^Venda:\s*/i, "").replace(/^Locação:\s*/i, "").trim();

    heroShowcaseMain.innerHTML = `
        <article class="hero-showcase-card">
        <span class="hero-showcase-badge">Destaque da semana</span>
        <div class="hero-showcase-action">
          <a class="hero-showcase-icon hero-showcase-map-link" href="${mapsUrlForItem(item)}" target="_blank" rel="noopener" aria-label="Abrir mapa do imóvel">
            <svg viewBox="0 0 24 24"><path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
          </a>
        </div>
        <img class="showcase-image" ${responsiveImageAttrs(item.imagem, `Imóvel ${item.referencia}`, { width: 1200, height: 800, sizes: "(max-width: 768px) 100vw, 50vw", loading: "eager", fetchpriority: "high" })} />
        <div class="hero-showcase-panel">
          <div class="hero-showcase-city"><span class="hero-showcase-city-icon">${iconSvg("city")}</span><span>${city}${bairroLabel ? ` · ${bairroLabel}` : ""}</span></div>
          <h3 class="hero-showcase-title">${escapeHtml(item.tipo || "Imóvel")}${item.finalidade ? ` ${item.finalidade === "venda" ? "à venda" : item.finalidade === "aluguel" ? "para locação" : ""}` : ""}</h3>
          <div class="hero-showcase-meta">
            <span>${escapeHtml(pluralize(item.dormitorios, "quarto", "quartos"))}${item.vagas ? ` · ${escapeHtml(pluralize(item.vagas, "vaga", "vagas"))}` : ""}</span>
            <strong class="hero-showcase-price">${escapeHtml(price || "Consulte")}</strong>
          </div>
        </div>
      </article>
    `;

    heroShowcaseStrip.querySelectorAll(".hero-showcase-thumb").forEach((btn) => btn.classList.toggle("active", Number(btn.dataset.index) === state.index));
  };

  function renderStrip() {
    heroShowcaseStrip.innerHTML = picks.slice(1, 4).map((item, i) => `
    <button type="button" class="hero-showcase-thumb ${i === 0 ? "active" : ""}" data-index="${i + 1}" aria-label="Ver imóvel em destaque ${i + 2}">
      <img ${responsiveImageAttrs(item.imagem, `Miniatura ${item.referencia}`, { width: 420, height: 280, sizes: "33vw", loading: "lazy" })} />
      <span class="hero-showcase-thumb-label">${escapeHtml(String(item.venda || item.locacao || "").trim() || "Consulte")}</span>
    </button>
  `).join("");

    heroShowcaseStrip.querySelectorAll(".hero-showcase-thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        reorderToFront(Number(btn.dataset.index) || 0);
      });
    });
  }

  renderStrip();
  renderMain();
}

function renderDestaques() {
  const featured = imoveis.filter((item) => item.destaque);
  const picks = featured.length ? featured : imoveis;
  buildHeroShowcase(picks.slice(0, 4));
}

function filterByValor(prop, range) {
  if (!range) return true;
  const [min, max] = range.split("-").map(Number);
  const val = parseCurrency(prop.venda) || parseCurrency(prop.locacao);
  if (range.endsWith("+")) return val >= min;
  return val >= min && val <= max;
}

function filterByValueRange(prop, minValue, maxValue) {
  const val = parseCurrency(prop.venda) || parseCurrency(prop.locacao);
  const min = Number(minValue || 0);
  const max = Number(maxValue || 0);
  if (minValue && val < min) return false;
  if (maxValue && max !== 999999999 && val > max) return false;
  return true;
}

function syncPlaceholderState(el) {
  if (!el) return;
  el.classList.toggle("is-placeholder", !String(el.value || "").trim());
}

function fillSelect(id, values) {
  values.forEach((item) => {
    const o = document.createElement("option");
    o.value = item;
    o.textContent = item;
    id.appendChild(o);
  });
}

function syncHeroSearchLayout() {
  if (!heroSearchGrid || !heroMoreGrid || !heroSearchCard || !heroMoreFilters || !tipo || !cidade || !bairro) return;
  const mobile = heroSearchMobileMQ.matches;
  const tipoField = tipo.closest(".hero-field");
  const cidadeField = cidade.closest(".hero-field");
  const bairroField = bairro.closest(".hero-field");
  if (!tipoField || !cidadeField || !bairroField) return;

  if (mobile) {
    if (tipoField.parentElement !== heroMoreGrid) heroMoreGrid.insertBefore(tipoField, heroMoreGrid.firstChild);
    if (cidadeField.parentElement !== heroMoreGrid) heroMoreGrid.insertBefore(cidadeField, heroMoreGrid.firstChild);
    if (bairroField.parentElement !== heroMoreGrid) heroMoreGrid.insertBefore(bairroField, heroMoreGrid.firstChild);
  } else {
    if (tipoField.parentElement !== heroSearchGrid) heroSearchGrid.appendChild(tipoField);
    if (cidadeField.parentElement !== heroSearchGrid) heroSearchGrid.appendChild(cidadeField);
    if (bairroField.parentElement !== heroSearchGrid) heroSearchGrid.appendChild(bairroField);
  }
}

function getFilterState() {
  return {
    categoria: categoriaFiltro || "",
    finalidade: finalidade?.value || "",
    tipo: tipo?.value || "",
    cidade: cidade?.value || "",
    bairro: bairro?.value || "",
    bairroTexto: bairroTexto?.value || "",
    valorMin: valorMin?.value || "",
    valorMax: valorMax?.value || "",
    quartos: heroQuartos?.value || "",
    suites: heroSuites?.value || "",
    vagas: heroVagas?.value || "",
    codigo: heroCodigo?.value || "",
    q: q?.value || "",
  };
}

function saveFilterState() {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(getFilterState()));
  } catch {
    // ignore
  }
}

function applyFilterState(state = {}) {
  categoriaFiltro = state.categoria || "";
  filtroFinalidade = state.finalidade || "";
  filtroQuartos = state.quartos || "";
  filtroVagas = state.vagas || "";
  filtroBairro = state.bairroTexto || state.bairro || "";
  filtroCodigo = state.codigo || "";
  if (finalidade) finalidade.value = state.finalidade || "";
  if (tipo) tipo.value = state.tipo || "";
  if (cidade) cidade.value = state.cidade || "";
  if (bairro) bairro.value = state.bairro || "";
  if (bairroTexto) bairroTexto.value = state.bairroTexto || "";
  if (valorMin) valorMin.value = state.valorMin || "";
  if (valorMax) valorMax.value = state.valorMax || "";
  if (heroQuartos) heroQuartos.value = state.quartos || "";
  if (heroSuites) heroSuites.value = state.suites || "";
  if (heroVagas) heroVagas.value = state.vagas || "";
  if (heroCodigo) heroCodigo.value = state.codigo || "";
  if (q) q.value = state.q || "";
  document.querySelectorAll(".hero-search-pills .pill").forEach((btn) => {
    const fin = btn.dataset.fin || "todos";
    btn.classList.toggle("active", (finalidade?.value || "") ? fin === finalidade.value : fin === "todos");
  });
  document.querySelectorAll(".category-card").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.cat || "") === categoriaFiltro);
  });
}

function formatMoneyShort(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);
}

function renderAppliedChips() {
  if (!activeFilterChips) return;
  const chips = [];
  const addChip = (filter, label, value) => {
    if (!value) return;
    chips.push(`<button type="button" class="filter-chip" data-filter="${filter}">${label}: ${value}<span aria-hidden="true">×</span></button>`);
  };

  activeFilterChips.innerHTML = "";
  addChip("finalidade", "Finalidade", finalidade?.value === "venda" ? "Comprar" : finalidade?.value === "aluguel" ? "Alugar" : "");
  addChip("tipo", "Tipo", tipo?.value || "");
  addChip("cidade", "Cidade", cidade?.value || "");
  addChip("bairro", "Bairro", bairro?.value || bairroTexto?.value || "");
  if (valorMin?.value || valorMax?.value) {
    const min = valorMin?.value ? formatMoneyShort(valorMin.value) : "";
    const max = valorMax?.value && valorMax.value !== "999999999" ? formatMoneyShort(valorMax.value) : "";
    addChip("valor", "Valor", `${min || "..."} até ${max || "..."}`);
  }
  addChip("quartos", "Quartos", heroQuartos?.value ? `${heroQuartos.value}+` : "");
  addChip("suites", "Suítes", heroSuites?.value ? `${heroSuites.value}+` : "");
  addChip("vagas", "Vagas", heroVagas?.value ? `${heroVagas.value}+` : "");
  addChip("codigo", "Código", heroCodigo?.value || "");

  activeFilterChips.innerHTML = `${chips.join("")} ${chips.length ? '<button type="button" class="filter-chip clear-all" id="clear-all-filters">Limpar filtros</button>' : ''}`;
}

function clearFilterByKey(key) {
  if (key === "finalidade" && finalidade) {
    finalidade.value = "";
    filtroFinalidade = "";
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
  }
  if (key === "tipo" && tipo) tipo.value = "";
  if (key === "cidade" && cidade) {
    cidade.value = "";
    populateBairros("");
  }
  if (key === "bairro") {
    if (bairro) bairro.value = "";
    if (bairroTexto) bairroTexto.value = "";
    filtroBairro = "";
    populateBairros(cidade?.value || "");
  }
  if (key === "valor" && valorMin && valorMax) {
    valorMin.value = "";
    valorMax.value = "";
  }
  if (key === "quartos" && heroQuartos) {
    heroQuartos.value = "";
    filtroQuartos = "";
  }
  if (key === "suites" && heroSuites) heroSuites.value = "";
  if (key === "vagas" && heroVagas) {
    heroVagas.value = "";
    filtroVagas = "";
  }
  if (key === "codigo" && heroCodigo) {
    heroCodigo.value = "";
    filtroCodigo = "";
  }
  if (key === "q" && q) q.value = "";
  saveFilterState();
  syncMobileSheet();
  render();
}

function clearAllFilters() {
  if (finalidade) finalidade.value = "";
  if (tipo) tipo.value = "";
  if (cidade) cidade.value = "";
  if (bairro) bairro.value = "";
  if (bairroTexto) bairroTexto.value = "";
  if (valorMin) valorMin.value = "";
  if (valorMax) valorMax.value = "";
  if (heroQuartos) heroQuartos.value = "";
  if (heroSuites) heroSuites.value = "";
  if (heroVagas) heroVagas.value = "";
  if (heroCodigo) heroCodigo.value = "";
  if (q) q.value = "";
  filtroFinalidade = "";
  categoriaFiltro = "";
  filtroQuartos = "";
  filtroVagas = "";
  filtroBairro = "";
  filtroCodigo = "";
  populateBairros("");
  document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".category-card").forEach((b) => b.classList.remove("active"));
  saveFilterState();
  syncMobileSheet();
  render();
}

activeFilterChips?.addEventListener("click", (event) => {
  const chip = event.target.closest(".filter-chip");
  if (!chip) return;
  if (chip.id === "clear-all-filters") {
    clearAllFilters();
    return;
  }
  const key = chip.dataset.filter;
  if (key) clearFilterByKey(key);
});

function loadFilterState() {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function normalizeBairroLabel(value) {
  return String(value || "").trim();
}

function uniqueBairrosForCity(cityValue) {
  return [...new Set(imoveis
    .filter((item) => !cityValue || item.cidade === cityValue)
    .map((item) => normalizeBairroLabel(item.bairro))
    .filter(Boolean))].sort();
}

function populateBairros(cityValue) {
  if (!bairro) return;
  const current = bairro.value;
  bairro.innerHTML = '<option value="">Selecione</option>';
  fillSelect(bairro, uniqueBairrosForCity(cityValue));
  if ([...bairro.options].some((opt) => opt.value === current)) bairro.value = current;
  else bairro.value = "";
  syncPlaceholderState(bairro);
}

function validateValueBounds() {
  const min = Number(valorMin?.value || 0);
  const max = Number(valorMax?.value || 0);
  if (!valorMin || !valorMax) return;
  if (valorMin.value && valorMax.value && max !== 999999999 && min > max) {
    valorMax.value = "";
  }
}

function syncValueBoundsOptions() {
  if (!valorMin || !valorMax) return;
  const min = Number(valorMin.value || 0);
  const max = Number(valorMax.value || 0);
  [...valorMin.options].forEach((opt) => {
    const v = Number(opt.value || 0);
    opt.disabled = Boolean(valorMax.value && max !== 999999999 && v > max && opt.value);
  });
  [...valorMax.options].forEach((opt) => {
    const v = Number(opt.value || 0);
    opt.disabled = Boolean(valorMin.value && v && v < min && opt.value !== "999999999");
  });
}

function populateSelects() {
  tipo.innerHTML = '<option value="">Tipo: Todos</option>';
  cidade.innerHTML = '<option value="">Cidade: Todas</option>';
  fillSelect(tipo, [...new Set(imoveis.map((i) => i.tipo).filter(Boolean))].sort());
  fillSelect(cidade, [...new Set(imoveis.map((i) => i.cidade).filter(Boolean))].sort());
  populateBairros(cidade.value);
  if (mobileFilterTipo) {
    mobileFilterTipo.innerHTML = '<option value="">Todos</option>';
    fillSelect(mobileFilterTipo, [...new Set(imoveis.map((i) => i.tipo).filter(Boolean))].sort());
  }
  if (mobileFilterCidade) {
    mobileFilterCidade.innerHTML = '<option value="">Todas</option>';
    fillSelect(mobileFilterCidade, [...new Set(imoveis.map((i) => i.cidade).filter(Boolean))].sort());
  }
}

function setImoveis(data) {
  imoveis = (Array.isArray(data) ? data : []).filter((item) => item && item.ativo !== false);
  populateSelects();
  if (!filtersRestored) filtersRestored = true;
  populateBairros(cidade?.value || "");
  [finalidade, tipo, cidade, bairro, bairroTexto, valorMin, valorMax, heroQuartos, heroSuites, heroVagas, heroCodigo, q, mobileFilterFinalidade, mobileFilterTipo, mobileFilterCidade, mobileFilterValor, mobileFilterQuartos, mobileFilterBairro].forEach(syncPlaceholderState);
  visibleCount = 12;
  updateTrustCount(imoveis.length);
  window.dispatchEvent(new CustomEvent("imoveis-ready", { detail: { total: imoveis.length } }));
  renderDestaques();
  render();
}

async function carregarImoveis() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("API indisponível");
    const payload = await response.json();
    const live = Array.isArray(payload.properties) ? payload.properties.map((item) => normalizeProperty(item)) : [];
    if (live.length) {
      setImoveis(live);
      return;
    }
  } catch (err) {
    // sem fallback local
  }
  setImoveis([]);
}

function render() {
  validateValueBounds();
  syncValueBoundsOptions();
  const filtrados = getFilteredImoveis();
  const lista = filtrados.length ? filtrados : imoveis;
  stats.textContent = `${filtrados.length} imóveis encontrados de ${imoveis.length} cadastrados.`;
  if (heroSearchPreview) heroSearchPreview.textContent = `${filtrados.length} imóveis encontrados`;
  const exibidos = lista.slice(0, visibleCount);
  cards.innerHTML = exibidos
    .map(
      (i) => `
      <article class="card reveal show">
        <div class="thumb-wrap">
          ${i.finalidade ? `<span class="card-purpose">${escapeHtml(i.finalidade === "aluguel" ? "Aluguel" : i.finalidade === "venda" ? "Venda" : i.finalidade)}</span>` : ""}
          <img ${responsiveImageAttrs(i.imagem, `Imovel ${i.referencia}`, { width: 800, height: 600, sizes: "(max-width: 768px) 100vw, 33vw", loading: "lazy" })} />
        </div>
        <div class="card-body">
          <div class="meta"><span class="tag">Ref ${escapeHtml(i.referencia || i._id)}</span></div>
          <h3 class="card-type">${escapeHtml(i.tipo || "Imóvel")}</h3>
          ${renderLocationInfo(i)}
          ${renderFeatureIcons(i, 4)}
          ${renderPriceLine(i)}
          <div class="card-actions">
            <a class="btn btn-primary" href="/detalhe.html?id=${encodeURIComponent(refKey(i.referencia || i._id).raw)}">Ver detalhes</a>
             <a class="btn btn-outline" href="https://wa.me/5567984724138?text=${buildInterestMessage(i)}" target="_blank" rel="noopener">Tenho interesse</a>
          </div>
        </div>
      </article>`
    )
    .join("");

  if (loadMore) {
    loadMore.style.display = lista.length > visibleCount ? "inline-flex" : "none";
  }
  validateValueBounds();
  renderAppliedChips();
}

function getFilteredImoveis() {
  const term = q?.value.toLowerCase().trim() || "";
  return imoveis.filter((i) => {
    const hitTerm = !term || `${i.referencia} ${i.endereco} ${i.tipo}`.toLowerCase().includes(term);
    const hitFinalidade = !finalidade?.value || matchesFinalidade(i.finalidade, finalidade.value);
    const hitTipo = !tipo.value || i.tipo === tipo.value;
    const hitCategoria = !categoriaFiltro || matchesCategory(i.tipo, categoriaFiltro);
    const hitCidade = !cidade.value || i.cidade === cidade.value;
    const hitValor = filterByValueRange(i, valorMin?.value, valorMax?.value);
    const hitQuartos = !filtroQuartos || Number(i.dormitorios || 0) >= Number(filtroQuartos);
    const hitSuites = !heroSuites?.value || Number(i.suites || 0) >= Number(heroSuites.value);
    const hitVagas = !filtroVagas || Number(i.vagas || i.garagens || 0) >= Number(filtroVagas);
    const selectedBairro = `${bairro?.value || ""} ${bairroTexto?.value || ""}`.trim().toLowerCase();
    const textBairro = `${i.bairro || ""} ${i.endereco || ""}`.toLowerCase();
    const hitBairro = !selectedBairro || textBairro.includes(selectedBairro);
    const code = String(filtroCodigo || "").trim().toLowerCase();
    const hitCodigo = !code || String(i.referencia || i._id || "").toLowerCase().includes(code);
    return hitTerm && hitTipo && hitCategoria && hitFinalidade && hitCidade && hitValor && hitQuartos && hitSuites && hitVagas && hitBairro && hitCodigo;
  });
}

function matchesFinalidade(value, selected) {
  if (!selected) return true;
  if (selected === "venda") return value === "venda" || value === "ambos";
  if (selected === "aluguel") return value === "aluguel" || value === "ambos";
  return value === selected;
}

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesCategory(type, category) {
  if (!category) return true;
  const t = normalizeText(type);
  const c = normalizeText(category);
  if (c === "comercial") return t.includes("comercial") || t.includes("loja") || t.includes("sala");
  if (c === "chacara") return t.includes("chacara") || t.includes("sitio");
  return t === c || t.includes(c);
}

function syncMobileSheet() {
  if (mobileFilterQ) mobileFilterQ.value = q?.value || "";
  if (mobileFilterTipo) mobileFilterTipo.value = tipo.value;
  if (mobileFilterCidade) mobileFilterCidade.value = cidade.value;
  if (mobileFilterValor) {
    const min = valorMin?.value || "";
    const max = valorMax?.value || "";
    mobileFilterValor.value = min && max ? `${min}-${max}` : min && !max ? `${min}+` : "";
  }
  if (mobileFilterQuartos) mobileFilterQuartos.value = filtroQuartos;
  if (mobileFilterBairro) mobileFilterBairro.value = bairroTexto?.value || bairro?.value || "";
  if (mobileFilterFinalidade) mobileFilterFinalidade.value = finalidade?.value || "";
  [mobileFilterFinalidade, mobileFilterTipo, mobileFilterCidade, mobileFilterValor, mobileFilterQuartos, mobileFilterBairro].forEach(syncPlaceholderState);
}

function openMobileFilters() {
  syncMobileSheet();
  mobileFilterSheet?.classList.add("open");
  mobileFilterBackdrop?.classList.add("open");
  mobileFilterSheet?.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeMobileFilters() {
  mobileFilterSheet?.classList.remove("open");
  mobileFilterBackdrop?.classList.remove("open");
  mobileFilterSheet?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function applyMobileFilters() {
  if (q) q.value = mobileFilterQ?.value || "";
  tipo.value = mobileFilterTipo?.value || "";
  cidade.value = mobileFilterCidade?.value || "";
  if (finalidade) finalidade.value = mobileFilterFinalidade?.value || "";
  filtroFinalidade = finalidade?.value || "";
  if (mobileFilterValor?.value) {
    if (mobileFilterValor.value.endsWith("+")) {
      if (valorMin) valorMin.value = mobileFilterValor.value.replace(/\+$/, "");
      if (valorMax) valorMax.value = "999999999";
    } else {
      const [minValue, maxValue] = mobileFilterValor.value.split("-");
      if (valorMin) valorMin.value = minValue || "";
      if (valorMax) valorMax.value = maxValue || "";
    }
  } else {
    if (valorMin) valorMin.value = "";
    if (valorMax) valorMax.value = "";
  }
  filtroQuartos = mobileFilterQuartos?.value || "";
  if (bairroTexto) bairroTexto.value = mobileFilterBairro?.value || "";
  if (bairro) bairro.value = "";
  document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
  const activePill = document.querySelector(`.hero-search-pills .pill[data-fin="${finalidade?.value || "todos"}"]`);
  activePill?.classList.add("active");
  populateBairros(cidade.value);
  saveFilterState();
  visibleCount = 12;
  render();
  closeMobileFilters();
}

[q, finalidade, tipo, cidade, valorMin, valorMax].forEach((el) => el && el.addEventListener("input", () => {
  saveFilterState();
  visibleCount = 12;
  render();
}));

[finalidade, tipo, cidade, bairro, bairroTexto, valorMin, valorMax, heroQuartos, heroSuites, heroVagas, heroCodigo].forEach((el) => {
  syncPlaceholderState(el);
  el?.addEventListener("change", () => syncPlaceholderState(el));
});

cidade?.addEventListener("change", () => {
  populateBairros(cidade.value);
  if (mobileFilterCidade) mobileFilterCidade.value = cidade.value;
  saveFilterState();
  visibleCount = 12;
  render();
});

bairro?.addEventListener("change", () => {
  if (bairroTexto) bairroTexto.value = "";
  saveFilterState();
  visibleCount = 12;
  render();
});

[valorMin, valorMax].forEach((el) => el?.addEventListener("change", () => {
  validateValueBounds();
  syncPlaceholderState(valorMin);
  syncPlaceholderState(valorMax);
  saveFilterState();
  visibleCount = 12;
  render();
}));

[heroQuartos, heroSuites, heroVagas, heroCodigo, bairroTexto].forEach((el) => el?.addEventListener("input", () => {
  if (el === bairroTexto && bairro) bairro.value = "";
  saveFilterState();
  visibleCount = 12;
  render();
}));

document.querySelectorAll(".hero-search-pills .pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    finalidade.value = btn.dataset.fin === "todos" ? "" : btn.dataset.fin;
    saveFilterState();
    visibleCount = 12;
    render();
  });
});

document.querySelectorAll(".category-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-card").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    categoriaFiltro = btn.dataset.cat || "";
    if (finalidade) finalidade.value = "";
    tipo.value = "";
    saveFilterState();
    document.querySelectorAll(".hero-search-pills .pill").forEach((b) => b.classList.remove("active"));
    visibleCount = 12;
    document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" });
    render();
  });
});

if (loadMore) {
  loadMore.addEventListener("click", () => {
    visibleCount += 12;
    render();
  });
}

if (bairroTexto) bairroTexto.addEventListener("input", () => { saveFilterState(); visibleCount = 12; render(); });
if (heroQuartos) heroQuartos.addEventListener("input", () => { filtroQuartos = heroQuartos.value || ""; saveFilterState(); visibleCount = 12; render(); });
if (heroSuites) heroSuites.addEventListener("input", () => { saveFilterState(); visibleCount = 12; render(); });
if (heroVagas) heroVagas.addEventListener("input", () => { filtroVagas = heroVagas.value || ""; saveFilterState(); visibleCount = 12; render(); });
if (heroCodigo) heroCodigo.addEventListener("input", () => { filtroCodigo = heroCodigo.value || ""; saveFilterState(); visibleCount = 12; render(); });

mobileFilterTrigger?.addEventListener("click", openMobileFilters);
mobileFilterClose?.addEventListener("click", closeMobileFilters);
mobileFilterBackdrop?.addEventListener("click", closeMobileFilters);
mobileFilterApply?.addEventListener("click", applyMobileFilters);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileFilters();
});

populateSelects();
if (heroSearchMobileMQ.addEventListener) heroSearchMobileMQ.addEventListener("change", syncHeroSearchLayout);
else if (heroSearchMobileMQ.addListener) heroSearchMobileMQ.addListener(syncHeroSearchLayout);
syncHeroSearchLayout();
[finalidade, tipo, cidade, bairro, bairroTexto, valorMin, valorMax, heroQuartos, heroSuites, heroVagas, heroCodigo, q, mobileFilterFinalidade, mobileFilterTipo, mobileFilterCidade, mobileFilterValor, mobileFilterQuartos, mobileFilterBairro].forEach(syncPlaceholderState);
buildHeroShowcase(fallbackImoveis.filter((i) => i.destaque).slice(0, 4).concat(fallbackImoveis.filter((i) => !i.destaque).slice(0, 4)).slice(0, 4));
render();
carregarImoveis();

if (window.IntersectionObserver) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("show")),
    { threshold: 0.2 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("show"));
}

window.addEventListener("scroll", () => {
  const y = window.scrollY * 0.18;
  document.querySelector(".hero").style.backgroundPosition = `center calc(50% + ${y}px)`;
});
