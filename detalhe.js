async function initDetail() {
  const API_URL = "https://lgn-admin-80oh.onrender.com/api/properties?limit=500";
  const box = document.getElementById("detalhe");

  if (box) {
    box.innerHTML = `
      <section class="detail-wrap">
        <h1>Carregando imóvel...</h1>
        <p>Buscando os dados do anúncio.</p>
      </section>
    `;
  }

  function formatMoney(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  }

  function isCloudinaryUrl(url) {
    return typeof url === "string" && /res\.cloudinary\.com/.test(url) && /\/upload\//.test(url);
  }

  function cloudinaryVariant(url, width, height) {
    if (!isCloudinaryUrl(url)) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`);
  }

  function cloudinarySrcset(url, width, height) {
    return [400, 800, 1200]
      .map((w) => `${cloudinaryVariant(url, w, Math.round((height || 800) * (w / (width || 1200))))} ${w}w`)
      .join(", ");
  }

  function responsiveImageAttrs(url, alt, options = {}) {
    const { width, height, sizes, loading = "lazy", fetchpriority } = options;
    const parts = [`src="${isCloudinaryUrl(url) ? cloudinaryVariant(url, width || 1200, height || 800) : url}"`, `alt="${alt}"`];

    if (isCloudinaryUrl(url)) {
      parts.push(`srcset="${cloudinarySrcset(url, width || 1200, height || 800)}"`);
      if (sizes) parts.push(`sizes="${sizes}"`);
    }

    if (width) parts.push(`width="${width}"`);
    if (height) parts.push(`height="${height}"`);
    if (loading) parts.push(`loading="${loading}"`);
    if (fetchpriority) parts.push(`fetchpriority="${fetchpriority}"`);
    return parts.join(" ");
  }

  function normalizeProperty(item, extra = {}) {
    const photos = extra.fotos || (Array.isArray(item.imagens) && item.imagens.length ? item.imagens : item.imagem ? [item.imagem] : []);
    return {
      _id: item._id || "",
      referencia: String(item.referencia || ""),
      tipo: item.tipo || "",
      finalidade: item.finalidade || "",
      cidade: extra.cidade || item.cidade || "",
      bairro: extra.bairro || item.bairro || "",
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
      temAreaGourmet: Boolean(item.temAreaGourmet ?? extra.temAreaGourmet ?? item.areaGourmet),
      financiavel: Boolean(item.financiavel ?? extra.financiavel),
      aceitaProposta: Boolean(item.aceitaProposta ?? extra.aceitaProposta),
      aceitaVeiculo: Boolean(item.aceitaVeiculo ?? extra.aceitaVeiculo),
      imovelNovo: Boolean(item.imovelNovo ?? extra.imovelNovo),
      piscina: Boolean(item.piscina ?? extra.piscina),
      murado: Boolean(item.murado ?? extra.murado),
      documentacaoRegular: Boolean(item.documentacaoRegular ?? extra.documentacaoRegular),
      area: extra.area || item.area || (item.areaTotal || item.areaConstruida || item.metragem ? `${item.areaTotal || item.areaConstruida || item.metragem} m²` : ""),
      metragem: Number(item.metragem || item.areaTotal || item.areaConstruida || 0),
      venda: item.venda || formatMoney(item.valorVenda),
      locacao: item.locacao || formatMoney(item.valorLocacao),
      destaque: Boolean(item.destaque ?? extra.destaque),
      tourVirtual: Boolean(extra.tourVirtual ?? item.tourVirtual),
      descricao: item.descricao || "",
      ativo: item.ativo !== false,
    };
  }

  function refKey(value) {
    const raw = String(value ?? "").trim();
    const numeric = raw.replace(/^0+(\d)$/, "$1");
    return { raw, numeric };
  }

  function acaoLabel(value) {
    if (value === "ambos") return "Venda e locação";
    if (value === "venda") return "Venda";
    return "Locação";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
      finalidade: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V5h14v14z"/><path d="M9 9h6M9 13h6"/></svg>',
      venda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16"/><path d="M7 17V7h10v10"/><path d="M10 14h4"/></svg>',
      locacao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9l7-4 7 4v10"/><path d="M9 19v-5h6v5"/></svg>',
    };
    return icons[type] || icons.dormitorios;
  }

  function iconSvg(name) {
    const icons = {
      city: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l4-2v14"/><path d="M8 20V5l5-2v17"/><path d="M13 20v-9l7-3v12"/></svg>',
      bairro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5 6-11a6 6 0 0 0-12 0c0 6 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    };
    return icons[name] || icons.city;
  }

  function detailCards(item, acao, preco) {
    const cards = [];
    const isMoneyValid = (value) => parseFloat(String(value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) > 0;
    const pushText = (label, value) => {
      if (value === null || value === undefined || value === "" || value === 0 || value === "0" || value === "0 m²" || value === "R$ 0,00") return;
      cards.push({ type: "text", label, value });
    };
    const pushFeature = (key, label, value) => {
      const n = Number(value) || 0;
      if (!n) return;
      cards.push({ type: "feature", key, label, value: n });
    };

    pushText("Área total", item.areaTotal ? `${item.areaTotal} m²` : item.area && item.area !== "0" && item.area !== "0 m²" ? item.area : "");
    pushText("Área construída", item.areaConstruida ? `${item.areaConstruida} m²` : "");
    pushFeature("suites", "Suíte", item.suites);
    pushFeature("dormitorios", "Dormitório", item.dormitorios);
    pushFeature("banheiros", "Banheiro", item.banheiros);
    pushFeature("salas", "Sala", item.salas);
    pushFeature("cozinhas", "Cozinha", item.cozinhas);
    pushFeature("areaGourmet", "Área gourmet", item.areaGourmet);
    pushFeature("areaServico", "Área de serviço", item.areaServico);
    pushFeature("copa", "Copa", item.copa);
    pushFeature("varandas", "Varanda", item.varandas);
    pushFeature("vagas", "Garagem", item.garagens || item.vagas);
    return cards;
  }

  function detailDifferentials(item) {
    const entries = [
      { key: "financiavel", label: "Financiável", value: item.financiavel },
      { key: "aceitaProposta", label: "Aceita proposta", value: item.aceitaProposta },
      { key: "aceitaVeiculo", label: "Aceita veículo", value: item.aceitaVeiculo },
      { key: "imovelNovo", label: "Imóvel novo", value: item.imovelNovo },
      { key: "areaGourmet", label: "Área gourmet", value: item.temAreaGourmet || item.areaGourmet > 0 },
      { key: "piscina", label: "Piscina", value: item.piscina },
      { key: "murado", label: "Murado", value: item.murado },
      { key: "documentacaoRegular", label: "Documentação regular", value: item.documentacaoRegular },
    ];
    const active = entries.filter((entry) => Boolean(entry.value) || Number(entry.value) > 0);
    if (!active.length) return "";
    return `
      <section class="detail-differentials">
        <div class="section-title-wrap">
          <p class="eyebrow">Diferenciais</p>
          <h2>Diferenciais</h2>
        </div>
        <div class="detail-differentials-grid">
          ${active.map((entry) => `<span class="detail-diff-chip">${entry.label}</span>`).join("")}
        </div>
      </section>
    `;
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

  function buildInterestMessage(item) {
    const ref = String(item.referencia || item._id || "").trim();
    const bairro = String(item.bairro || "").trim();
    let message = `Olá! Tenho interesse no imóvel ${ref ? `(código ${ref})` : ""}`.trim();
    if (bairro) message += `, localizado no Bairro ${bairro}`;
    message += `. Gostaria de receber mais informações e verificar disponibilidade para visita.`;
    return encodeURIComponent(message);
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function propertySlugFor(item) {
    const tipo = slugify(item.tipo || "imovel");
    const finalidade = item.finalidade === "venda" ? "a-venda" : item.finalidade === "aluguel" ? "para-locacao" : "a-venda-e-locacao";
    const bairro = slugify(item.bairro || "");
    const cidade = slugify(item.cidade || "");
    const ref = slugify(item.referencia || item._id || "");
    return [tipo, finalidade, bairro, cidade, ref].filter(Boolean).join("-");
  }

  function propertySlugLooseFor(item) {
    const ref = slugify(String(item.referencia || item._id || "").replace(/^[^0-9]+/, ""));
    const tipo = slugify(item.tipo || "imovel");
    const finalidade = item.finalidade === "venda" ? "a-venda" : item.finalidade === "aluguel" ? "para-locacao" : "a-venda-e-locacao";
    const bairro = slugify(item.bairro || "");
    const cidade = slugify(item.cidade || "");
    return [tipo, finalidade, bairro, cidade, ref].filter(Boolean).join("-");
  }

  function propertyRefTail(item) {
    const refSlug = slugify(item.referencia || item._id || "");
    return refSlug.split("-").filter(Boolean).slice(-1)[0] || refSlug;
  }

  function requestedToken() {
    const params = new URLSearchParams(window.location.search);
    const pathnameParts = window.location.pathname.split("/").filter(Boolean);
    const pathToken = (pathnameParts[0] === "imovel" || pathnameParts[0] === "imoveis") ? decodeURIComponent(pathnameParts.slice(1).join("/") || "") : "";
    return params.get("ref") || params.get("id") || pathToken || "";
  }

  function detailUrlFor(item) {
    return `/imoveis/${encodeURIComponent(propertySlugFor(item))}`;
  }

  function propertyTitle(item) {
    const acao = acaoLabel(item.finalidade);
    const acaoText = acao === "Venda" ? "à venda" : acao === "Locação" ? "para locação" : "à venda e locação";
    const local = item.bairro ? `no Bairro ${item.bairro}, ${item.cidade}` : `${item.cidade}`;
    return `${item.tipo} ${acaoText} ${local} – ${item.referencia || item._id} | LGN Imóveis`;
  }

  function propertyDescription(item) {
    const parts = [];
    const local = item.bairro ? `no Bairro ${item.bairro}, em ${item.cidade}-MS` : `em ${item.cidade}-MS`;
    parts.push(`${item.tipo} ${acaoLabel(item.finalidade).toLowerCase()} ${local}`);
    if (item.dormitorios) parts.push(`${item.dormitorios} quartos`);
    if (item.suites) parts.push(`${item.suites} suíte${item.suites > 1 ? "s" : ""}`);
    if (item.vagas) parts.push(`${item.vagas} vaga${item.vagas > 1 ? "s" : ""}`);
    const areaValue = item.areaTotal || item.areaConstruida || item.metragem;
    if (areaValue) parts.push(`${areaValue} m²`);
    return `${parts.join(", ")}. Consulte o valor e agende uma visita.`;
  }

  async function loadProperties() {
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("API indisponível");
      const payload = await response.json();
      const live = Array.isArray(payload.properties)
        ? payload.properties.map((item) => {
            const extra = typeof IMOVEIS_ENRICHMENT !== "undefined" ? IMOVEIS_ENRICHMENT[String(item.referencia)] : null;
            return normalizeProperty(item, extra || {});
          })
        : [];
      if (live.length) return live.filter((item) => item.ativo !== false);
    } catch (err) {
      // usa fallback local
    }
    const baseImoveis = typeof IMOVEIS !== "undefined" ? IMOVEIS : [];
    return baseImoveis.map((item) => {
      const extra = (typeof IMOVEIS_ENRICHMENT !== "undefined" && IMOVEIS_ENRICHMENT[item.referencia]) || {};
      return normalizeProperty({ ...item, imagens: [item.imagem] }, extra);
    }).filter((item) => item.ativo !== false);
  }

  const refParam = requestedToken();
  const propriedades = await loadProperties();
  const target = refKey(refParam);
  const requestedSlug = slugify(refParam);
  const imovelRaw = propriedades.find((item) => {
    const ref = refKey(item.referencia);
    const refTail = propertyRefTail(item);
    const slugMatch = requestedSlug && (
      propertySlugFor(item) === requestedSlug ||
      propertySlugLooseFor(item) === requestedSlug ||
      requestedSlug.endsWith(`-${refTail}`) ||
      requestedSlug === refTail
    );
    return ref.raw === target.raw || ref.numeric === target.numeric || item._id === refParam || slugMatch || (!refParam && item.referencia);
  });
  const imovel = imovelRaw ? imovelRaw : null;
  if (!box) return;

  if (!imovel) {
    box.innerHTML = `
      <section class="detail-wrap">
        <h1>Imóvel não encontrado</h1>
        <p>O anúncio solicitado não existe ou foi removido.</p>
        <a class="btn btn-primary" href="/#imoveis">Voltar para listagem</a>
      </section>
    `;
    return;
  }

  try {
    const fotos = Array.isArray(imovel.fotos) && imovel.fotos.length ? imovel.fotos : [imovel.imagem];
    const acao = acaoLabel(imovel.finalidade);
    const preco = imovel.venda !== "R$ 0,00" && imovel.venda !== "Consultar" ? imovel.venda
      : imovel.locacao !== "R$ 0,00" && imovel.locacao !== "Consultar" ? imovel.locacao
      : null;
    const valueLabel = preco || "Consulte";
    const highlightCards = detailCards(imovel, acao, preco);
    const addressLine = [imovel.endereco, imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
    const mapQuery = encodeURIComponent(addressLine || imovel.cidade || imovel.bairro || "");
    const hasEmbeddableMapUrl = typeof imovel.mapaUrl === "string" && /(?:output=embed|\/embed\b|\/maps\/embed)/i.test(imovel.mapaUrl);
    const mapEmbedSrc = hasEmbeddableMapUrl ? imovel.mapaUrl : `https://www.google.com/maps?q=${mapQuery}&output=embed`;
    const mapOpenHref = imovel.mapaUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
    const whatsAppSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 16.8L2 22l5.4-1.4A11 11 0 1 0 20.5 3.5zm-8.9 16.1a9 9 0 0 1-4.6-1.3l-.3-.2-3.2.8.9-3.1-.2-.3A9 9 0 1 1 11.6 19.6zm5.2-6.8c-.3-.2-1.8-.9-2-1s-.4-.2-.6.2-.7 1-.9 1.2-.3.2-.6.1a7.2 7.2 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5s0-.3 0-.5-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.3.9 2.7 1 2.9c.1.2 1.8 2.8 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.8-.7 2.1-1.3.3-.6.3-1.1.2-1.3s-.3-.2-.6-.4z"/></svg>';
    const shareSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>';

    const seoTitle = propertyTitle(imovel);
    const seoDesc = propertyDescription(imovel);
    document.title = seoTitle;
    const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    const canonicalPath = detailUrlFor(imovel);
    const slugUrl = `${window.location.origin}${canonicalPath}`;
    setMeta('meta[name="description"]', "content", seoDesc);
    setMeta('meta[property="og:title"]', "content", seoTitle);
    setMeta('meta[property="og:description"]', "content", seoDesc);
    setMeta('meta[property="og:image"]', "content", fotos[0]);
    setMeta('meta[property="og:image:width"]', "content", "1200");
    setMeta('meta[property="og:image:height"]', "content", "630");
    setMeta('meta[property="og:image:type"]', "content", "image/jpeg");
    setMeta('meta[property="og:url"]', "content", slugUrl);
    setMeta('link[rel="canonical"]', "href", slugUrl);
    if (window.location.protocol !== "file:" && window.location.pathname !== canonicalPath) {
      history.replaceState({}, "", canonicalPath);
    }

    const schemaTypeMap = {
      "Casa": "House", "Sobrado": "House", "Kitnet": "Apartment",
      "Apartamento": "Apartment", "Loja": "Product", "Terreno": "LandPlot",
      "Chácara": "SingleFamilyResidence", "Fazenda": "SingleFamilyResidence",
      "Prédio": "Product", "Flat": "Apartment", "Cobertura": "Apartment",
      "Sala": "Product"
    };
    const schemaType = schemaTypeMap[imovel.tipo] || "Product";

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    const ldData = {
      "@context": "https://schema.org",
      "@type": ["Product", schemaType],
      "name": seoTitle,
      "description": seoDesc,
      "image": fotos,
      "url": slugUrl,
      "category": imovel.tipo,
      "additionalProperty": [
        {"@type": "PropertyValue", "name": "Dormitórios", "value": imovel.dormitorios},
        {"@type": "PropertyValue", "name": "Vagas", "value": imovel.vagas},
        {"@type": "PropertyValue", "name": "Área total", "value": imovel.areaTotal || imovel.areaConstruida || imovel.metragem},
        {"@type": "PropertyValue", "name": "Área construída", "value": imovel.areaConstruida || imovel.areaTotal || imovel.metragem}
      ]
    };
    if (preco) {
      ldData.offers = {
        "@type": "Offer",
        "price": preco.replace(/[R$\s.]/g, "").replace(",", "."),
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "seller": {"@type": "RealEstateAgent", "name": "LGN Empreendimentos Imobiliários"}
      };
    }
    ld.textContent = JSON.stringify(ldData);
    document.head.appendChild(ld);
    const semelhantes = propriedades
      .filter((item) => item.referencia !== imovel.referencia)
      .filter((item) => item.tipo === imovel.tipo || item.cidade === imovel.cidade || item.finalidade === imovel.finalidade)
      .slice(0, 3);
    const gallerySidePhotos = fotos.slice(1, 5);

  box.innerHTML = `
    <article class="detail-wrap reveal show">
      <div class="detail-badge-destaque">Em destaque</div>
      <div class="gallery-premium">
        <div class="gallery-hero">
          <div class="gallery-main" id="gallery-main" tabindex="0" role="button" aria-label="Abrir foto em tela cheia">
          <img ${responsiveImageAttrs(fotos[0], `Imagem 1 do imóvel ${imovel.referencia}`, { width: 1200, height: 800, sizes: "(max-width: 768px) 100vw, 50vw", loading: "eager", fetchpriority: "high" })} class="gallery-main-img" id="gallery-main-img" />
          <button type="button" class="gallery-open-btn" id="gallery-open-btn" aria-label="Abrir foto em tela cheia">Ampliar</button>
          <div class="gallery-counter"><span id="gallery-idx">1</span> / ${fotos.length} fotos</div>
          ${fotos.length > 1 ? '<button class="slide-btn prev" id="prev-photo" aria-label="Foto anterior">\u2039</button><button class="slide-btn next" id="next-photo" aria-label="Próxima foto">\u203A</button>' : ''}
          </div>
          <div class="gallery-side" id="gallery-side">
            ${gallerySidePhotos.map((f, i) => {
              const absoluteIndex = i + 1;
              const isLast = i === 3 && fotos.length > 5;
              const label = isLast ? `+${fotos.length - 5}` : `Foto ${absoluteIndex + 1}`;
              return `<button type="button" class="gallery-side-thumb gallery-preview-btn ${i === 0 ? 'active' : ''}" data-index="${absoluteIndex}" aria-label="Foto ${absoluteIndex + 1}"><img ${responsiveImageAttrs(f, `Miniatura ${absoluteIndex + 1}`, { width: 360, height: 260, loading: "lazy" })} /><span class="gallery-side-overlay">${label}</span></button>`;
            }).join('')}
          </div>
        </div>
        <div class="gallery-dots" id="gallery-dots">
          ${fotos.map((_, i) => `<button type="button" class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir para a foto ${i + 1}"></button>`).join('')}
        </div>
        <div class="gallery-thumbs" id="gallery-thumbs">
          ${fotos.map((f, i) => `<button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Foto ${i + 1}"><img ${responsiveImageAttrs(f, `Miniatura ${i + 1}`, { width: 200, height: 150, loading: "lazy" })} /></button>`).join('')}
        </div>
      </div>
      <div class="detail-content">
        <p class="detail-topline">${imovel.finalidade === "venda" ? "Venda" : imovel.finalidade === "aluguel" ? "Aluguel" : "Venda e locação"} | ${imovel.tipo} <a class="detail-share-inline" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp" href="https://wa.me/?text=${encodeURIComponent(window.location.href)}">${shareSvg}</a></p>
        <h1>${addressLine}</h1>
        <div class="detail-location-row">
          ${imovel.bairro ? `<span class="detail-location-chip"><span class="detail-location-icon">${iconSvg("bairro")}</span>${imovel.bairro}</span>` : ""}
          ${imovel.cidade ? `<span class="detail-location-chip"><span class="detail-location-icon">${iconSvg("city")}</span>${imovel.cidade}</span>` : ""}
        </div>
        <div class="detail-price-mobile">${escapeHtml(valueLabel)}</div>
        <div class="detail-mobile-cta">
          <a class="btn detail-whatsapp-btn" href="https://wa.me/5567984724138?text=${buildInterestMessage(imovel)}" target="_blank" rel="noopener">${whatsAppSvg}<span>Tenho Interesse</span></a>
        </div>

        <div class="detail-grid detail-grid-premium">
          ${highlightCards.map((item) => item.type === "text" ? `<div class="detail-card detail-card-text"><span>${item.label}</span><strong>${item.value}</strong></div>` : `<div class="detail-card detail-card-feature" title="${item.label}: ${item.value}"><span class="detail-card-icon">${featureIcon(item.key)}</span><span class="detail-card-meta"><span class="detail-card-label">${item.label}</span><strong>${item.value}</strong></span></div>`).join("")}
        </div>

        ${detailDifferentials(imovel)}

        <p class="descricao-imovel">
          Referência: <strong>${escapeHtml(imovel.referencia || imovel._id || "")}</strong><br>
          ${imovel.tipo} localizado em ${imovel.cidade}, na região ${imovel.endereco}. Disponibilidade para ${acao.toLowerCase()}.
          Para condições comerciais atualizadas e visita presencial, fale direto com a equipe da LGN Empreendimentos Imobiliários.
        </p>

        <section class="map-interactive detail-map-box">
          <div class="detail-map-head">
            <p class="detail-map-address"><span class="detail-map-address-icon">${iconSvg("bairro")}</span>${escapeHtml(addressLine || imovel.endereco || imovel.bairro || imovel.cidade || "")}</p>
          </div>
          <iframe title="Mapa do imóvel" src="${escapeHtml(mapEmbedSrc)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </section>

        <div class="detail-actions">
          <a class="btn btn-primary" href="https://wa.me/5567984724138?text=${buildInterestMessage(imovel)}" target="_blank" rel="noopener">Falar sobre este imóvel</a>
          <a class="btn btn-secondary" href="/#imoveis">Voltar aos imóveis</a>
        </div>

      </div>
    </article>

        ${semelhantes.length ? `
    <section class="similar-section detail-similar-full">
      <div class="section-title-wrap">
        <p class="eyebrow">Semelhantes</p>
        <h2>Imóveis parecidos</h2>
      </div>
      <div class="cards similar-cards">
        ${semelhantes.map((item) => {
          const extra = typeof IMOVEIS_ENRICHMENT !== "undefined" ? IMOVEIS_ENRICHMENT[item.referencia] : null;
          const foto = (extra && extra.fotos && extra.fotos[0]) || item.imagem;
          const endereco = (extra && extra.endereco) || item.endereco;
          const cidade = (extra && extra.cidade) || item.cidade;
          const url = detailUrlFor(item.referencia);
          return `
            <article class="card card-similar">
              <div class="thumb-wrap"><img ${responsiveImageAttrs(foto, `Imóvel ${item.referencia}`, { width: 800, height: 600, sizes: "(max-width: 768px) 100vw, 33vw", loading: "lazy" })} /></div>
              <div class="card-body">
                <div class="meta"><span class="tag">Ref ${item.referencia}</span><span class="tag">${item.tipo}</span></div>
                <h3>${endereco}</h3>
                <p>${cidade}</p>
                ${renderFeatureIcons(item, 4)}
                <div class="card-actions">
                  <a class="btn btn-primary" href="${url}">Ver detalhes</a>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>` : ''}

    <div class="gallery-modal" id="gallery-modal" aria-hidden="true">
      <button type="button" class="gallery-modal-close" id="gallery-modal-close" aria-label="Fechar">×</button>
      <button type="button" class="gallery-modal-nav prev" id="gallery-modal-prev" aria-label="Foto anterior">‹</button>
      <figure class="gallery-modal-figure">
        <img ${responsiveImageAttrs(fotos[0], `Foto ampliada 1 do imóvel ${imovel.referencia}`, { width: 1600, height: 1067, loading: "eager" })} id="gallery-modal-img" />
        <figcaption id="gallery-modal-caption">Foto 1 de ${fotos.length}</figcaption>
      </figure>
      <button type="button" class="gallery-modal-nav next" id="gallery-modal-next" aria-label="Próxima foto">›</button>
    </div>
  `;

  let photoIndex = 0;
  let modalOpen = false;
  let zoomed = false;
  const mainImg = document.getElementById("gallery-main-img");
  const counterEl = document.getElementById("gallery-idx");
   const thumbs = document.querySelectorAll(".gallery-thumb, .gallery-side-thumb");
   const mainHero = document.getElementById("gallery-main");
   const dots = document.querySelectorAll(".gallery-dot");
  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("gallery-modal-img");
  const modalCaption = document.getElementById("gallery-modal-caption");
  const openBtn = document.getElementById("gallery-open-btn");
  const closeBtn = document.getElementById("gallery-modal-close");
  const modalPrev = document.getElementById("gallery-modal-prev");
  const modalNext = document.getElementById("gallery-modal-next");
  const prevBtn = document.getElementById("prev-photo");
  const nextBtn = document.getElementById("next-photo");

  function renderActive(idx) {
    photoIndex = idx;
    mainImg.src = fotos[idx];
    mainImg.alt = `Imagem ${idx + 1} do imóvel ${imovel.referencia}`;
    if (isCloudinaryUrl(fotos[idx])) mainImg.srcset = cloudinarySrcset(fotos[idx], 1200, 800);
    else mainImg.removeAttribute("srcset");
    counterEl.textContent = idx + 1;
    thumbs.forEach((t) => t.classList.toggle("active", Number(t.dataset.index) === idx));
    dots.forEach((d) => d.classList.toggle("active", Number(d.dataset.index) === idx));
    const activeThumb = document.querySelector(`.gallery-thumb[data-index="${idx}"], .gallery-side-thumb[data-index="${idx}"]`);
    if (activeThumb) activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    if (modalOpen) {
      modalImg.src = fotos[idx];
      modalImg.alt = `Foto ampliada ${idx + 1} do imóvel ${imovel.referencia}`;
      if (isCloudinaryUrl(fotos[idx])) modalImg.srcset = cloudinarySrcset(fotos[idx], 1600, 1067);
      else modalImg.removeAttribute("srcset");
      modalCaption.textContent = `Foto ${idx + 1} de ${fotos.length}`;
      modalImg.classList.toggle("zoomed", zoomed);
    }
  }

  function openModal(idx) {
    modalOpen = true;
    zoomed = false;
    renderActive(idx);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    modalOpen = false;
    zoomed = false;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function step(delta) {
    renderActive((photoIndex + delta + fotos.length) % fotos.length);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => step(1));
  thumbs.forEach((t) => t.addEventListener("click", () => renderActive(parseInt(t.dataset.index, 10))));
  dots.forEach((d) => d.addEventListener("click", () => renderActive(parseInt(d.dataset.index, 10))));
  if (openBtn) openBtn.addEventListener("click", () => openModal(photoIndex));
  mainImg.addEventListener("click", () => openModal(photoIndex));
  if (mainHero) {
    mainHero.addEventListener("click", () => openModal(photoIndex));
    let touchStartX = 0;
    let touchStartY = 0;
    mainHero.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });
    mainHero.addEventListener("touchend", (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) step(1);
        else step(-1);
      }
    }, { passive: true });
    mainHero.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(photoIndex);
      }
    });
  }
  if (modalPrev) modalPrev.addEventListener("click", () => step(-1));
  if (modalNext) modalNext.addEventListener("click", () => step(1));
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modalImg.addEventListener("click", () => { zoomed = !zoomed; modalImg.classList.toggle("zoomed", zoomed); });

  let touchStartX = 0;
  modal.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  modal.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) step(-1); else step(1);
    }
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (!modalOpen) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  const shareNative = document.getElementById("share-native");
  if (shareNative) {
    shareNative.addEventListener("click", async () => {
      if (navigator.share) {
        await navigator.share({ title: `Imóvel ${imovel.referencia} - LGN Empreendimentos Imobiliários`, url: window.location.href });
      } else {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener");
      }
    });
  }

  const waFloat = document.getElementById("whatsapp-detalhe");
  if (waFloat) {
    waFloat.href = `https://wa.me/5567984724138?text=${buildInterestMessage(imovel)}`;
  }
  } catch (err) {
    box.innerHTML = `
      <section class="detail-wrap">
        <h1>Erro ao carregar o imóvel</h1>
        <p>${String(err.message || err)}</p>
        <a class="btn btn-primary" href="/#imoveis">Voltar para listagem</a>
      </section>
    `;
    console.error(err);
  }
}

initDetail();
