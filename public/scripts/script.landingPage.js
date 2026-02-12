document.addEventListener("DOMContentLoaded", () => {
  const contadorAnuncios = document.getElementById("contador-anuncios");
  const gridAnuncios = document.getElementById("listaAnuncios");
  const anunciosVazio = document.getElementById("anunciosVazio");

  const openBtn = document.getElementById("openFilter");
  const closeBtn = document.getElementById("closeFilter");
  const overlay = document.getElementById("filterOverlay");
  const panel = document.getElementById("filterPanel");

  const conservacaoSelect = document.getElementById("conservacaoSelect");
  const precoMaxRange = document.getElementById("precoMaxRange");
  const precoMinInput = document.getElementById("precoMinInput");
  const precoMaxInput = document.getElementById("precoMaxInput");
  const quantidadeSelect = document.getElementById("quantidadeSelect");
  const cidadeInput = document.getElementById("cidadeInput");
  const estadoSelect = document.getElementById("estadoSelect");
  const applyBtn = document.getElementById("applyFilters");
  const clearBtn = document.getElementById("clearFilters");

  let allAnuncios = [];
  let filteredAnuncios = [];

  function openFilter() {
    overlay.classList.remove("opacity-0", "pointer-events-none");
    overlay.classList.add("opacity-100");

    panel.classList.remove("translate-x-full");
    panel.classList.add("translate-x-0");

    document.body.classList.add("overflow-hidden");
  }

  function closeFilter() {
    overlay.classList.add("opacity-0", "pointer-events-none");
    overlay.classList.remove("opacity-100");

    panel.classList.add("translate-x-full");
    panel.classList.remove("translate-x-0");

    document.body.classList.remove("overflow-hidden");
  }

  openBtn?.addEventListener("click", openFilter);
  closeBtn?.addEventListener("click", closeFilter);
  overlay?.addEventListener("click", closeFilter);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFilter();
  });

  if (!contadorAnuncios || !gridAnuncios) {
    console.error("IDs não encontrados no HTML");
    return;
  }

  function formatCurrency(value) {
    if (!value && value !== 0) return "A combinar";
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function normalizeUFFromText(text) {
    const m = String(text || "").match(/-\s*([A-Z]{2})\s*$/);
    return m ? m[1] : "";
  }

  function getSelectedCategoria() {
    return document.querySelector('input[name="categoria"]:checked')?.value || "";
  }

  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

  function normalizePrecoInputs() {
    const maxAllowed = Number(precoMaxRange?.max || 50000);

    let minV = clamp(Number(precoMinInput?.value || 0), 0, maxAllowed);
    let maxV = clamp(Number(precoMaxInput?.value || maxAllowed), 0, maxAllowed);

    if (minV > maxV) minV = maxV;

    if (precoMinInput) precoMinInput.value = minV;
    if (precoMaxInput) precoMaxInput.value = maxV;
    if (precoMaxRange) precoMaxRange.value = maxV;
  }

  precoMaxRange?.addEventListener("input", () => {
    if (precoMaxInput) precoMaxInput.value = precoMaxRange.value;
    normalizePrecoInputs();
  });
  precoMinInput?.addEventListener("input", normalizePrecoInputs);
  precoMaxInput?.addEventListener("input", normalizePrecoInputs);

  function matchQuantidade(adQtd, filtro) {
    if (!filtro) return true;
    const qtd = Number(adQtd ?? 0);

    if (filtro === "1-10") return qtd >= 1 && qtd <= 10;
    if (filtro === "11-50") return qtd >= 11 && qtd <= 50;
    if (filtro === "51-100") return qtd >= 51 && qtd <= 100;
    if (filtro === "100+") return qtd >= 100;

    return true;
  }

  function getFilters() {
    const categoria = getSelectedCategoria();
    const conservacao = conservacaoSelect?.value || "";

    normalizePrecoInputs();
    const precoMin = Number(precoMinInput?.value || 0);
    const precoMax = Number(precoMaxInput?.value || 50000);

    const quantidade = quantidadeSelect?.value || "";

    const estadoText =
      estadoSelect?.options?.[estadoSelect.selectedIndex]?.textContent || "";
    const uf = normalizeUFFromText(estadoText);

    const cidade = (cidadeInput?.value || "").trim().toLowerCase();

    return { categoria, conservacao, precoMin, precoMax, quantidade, uf, cidade };
  }

  function strip(s) {
    return String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .trim()
      .toLowerCase();
  }

  const UF_FROM_NAME = {
    "acre": "AC",
    "alagoas": "AL",
    "amapa": "AP",
    "amazonas": "AM",
    "bahia": "BA",
    "ceara": "CE",
    "distrito federal": "DF",
    "espirito santo": "ES",
    "goias": "GO",
    "maranhao": "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    "para": "PA",
    "paraiba": "PB",
    "parana": "PR",
    "pernambuco": "PE",
    "piaui": "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    "rondonia": "RO",
    "roraima": "RR",
    "santa catarina": "SC",
    "sergipe": "SE",
    "sao paulo": "SP",
    "tocantins": "TO",
  };

  function anuncioUF(anuncio) {
    const raw = String(anuncio.estado ?? "").trim();

    if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();

    const key = strip(raw);
    return UF_FROM_NAME[key] || "";
  }

  function createCard(anuncio) {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col";

    const media = document.createElement("div");
    media.className = "relative";

    const image = document.createElement("img");
    image.className = "w-full h-40 object-cover";
    image.alt = anuncio.nomeProduto || "Anúncio";
    image.src = anuncio.nomeArquivo ? `/uploads/${anuncio.nomeArquivo}` : "/images/adicionar.png";

    const badge = document.createElement("span");
    const status = (anuncio.status || anuncio.situacao || "disponível").toString().toLowerCase();

    const isPending =
      status.includes("aguard") || status.includes("pend") || status.includes("coleta");

    badge.className =
      "absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-semibold text-white " +
      (isPending ? "bg-amber-500" : "bg-green-500");

    badge.textContent = isPending ? "aguardando coleta" : "disponível";

    media.appendChild(image);
    media.appendChild(badge);

    const body = document.createElement("div");
    body.className = "p-4 flex flex-col gap-3 flex-1";

    const chip = document.createElement("span");
    chip.className = "inline-flex w-fit px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-600";
    chip.textContent = anuncio.categoria || anuncio.tipoProduto || "Placas de Circuito";

    const titleWrap = document.createElement("div");
    titleWrap.className = "flex flex-col gap-1";

    const title = document.createElement("h4");
    title.className = "font-semibold text-darkblue text-sm leading-snug line-clamp-2";
    title.textContent = anuncio.nomeProduto || "Produto sem título";

    const subtitle = document.createElement("p");
    subtitle.className = "text-xs text-gray-500 line-clamp-1";
    subtitle.textContent = anuncio.descricao || "Lote de Alta Qualidade";

    titleWrap.appendChild(chip);
    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const meta = document.createElement("div");
    meta.className = "flex flex-col gap-1 text-xs text-gray-500";

    const companyRow = document.createElement("div");
    companyRow.className = "flex items-center gap-2";
    companyRow.innerHTML = `
      <i class="fa-solid fa-building text-gray-400"></i>
      <span class="line-clamp-1">${anuncio.nomeEmpresa || "TechCorp Eletrônicos"}</span>
    `;

    const locationRow = document.createElement("div");
    locationRow.className = "flex items-center gap-2";
    locationRow.innerHTML = `
      <i class="fa-solid fa-location-dot text-gray-400"></i>
      <span class="line-clamp-1">${(anuncio.cidade || "São Paulo")}, ${anuncio.estado || "SP"}</span>
    `;

    meta.appendChild(companyRow);
    meta.appendChild(locationRow);

    const footer = document.createElement("div");
    footer.className = "mt-auto pt-2 flex items-center justify-between";

    const price = document.createElement("p");
    price.className = "text-lg font-semibold text-darkblue";
    price.textContent = formatCurrency(anuncio.valorTotal);

    const btn = document.createElement("a");
    btn.className =
      "px-4 py-2 rounded-full bg-mainblue text-white text-xs font-semibold hover:opacity-90 transition";
    btn.textContent = "Ver Detalhes";
    btn.href = `/anuncios/${anuncio.idAnuncio || anuncio.id || ""}`;

    footer.appendChild(price);
    footer.appendChild(btn);

    body.appendChild(titleWrap);
    body.appendChild(meta);
    body.appendChild(footer);

    card.appendChild(media);
    card.appendChild(body);

    return card;
  }

  function renderAnuncios(lista) {
    gridAnuncios.innerHTML = "";

    if (!lista || lista.length === 0) {
      contadorAnuncios.textContent = "Nenhum anúncio encontrado.";
      anunciosVazio?.classList.remove("hidden");
      return;
    }

    anunciosVazio?.classList.add("hidden");
    contadorAnuncios.textContent = `${lista.length} anúncios disponíveis`;

    lista.forEach((anuncio) => {
      gridAnuncios.appendChild(createCard(anuncio));
    });
  }

  function aplicarFiltros() {
    const f = getFilters();

    const fCat = strip(f.categoria);
    const fCidade = strip(f.cidade);
    const fConserv = strip(f.conservacao);

    const userChangedPrice = (f.precoMin > 0) || (f.precoMax < 50000);

    filteredAnuncios = allAnuncios.filter((anuncio) => {
      const adCat = strip(anuncio.categoria || anuncio.tipoProduto);
      const adCidade = strip(anuncio.cidade);
      const adUF = anuncioUF(anuncio);

      const adConserv = strip(anuncio.conservacao || anuncio.estadoConservacao);
      const adQtd = Number(anuncio.quantidade ?? anuncio.qtd ?? anuncio.pesoKg ?? 0);

      const hasPreco =
        anuncio.valorTotal !== null &&
        anuncio.valorTotal !== undefined &&
        anuncio.valorTotal !== "";

      const adPreco = hasPreco ? Number(anuncio.valorTotal) : null;

      if (fCat && !adCat.includes(fCat)) return false;

      if (fConserv && adConserv) {
        if (!adConserv.includes(fConserv)) return false;
      }

      if (userChangedPrice) {
        if (adPreco === null || Number.isNaN(adPreco)) return false;
        if (adPreco < f.precoMin || adPreco > f.precoMax) return false;
      }

      if (f.quantidade && adQtd) {
        if (!matchQuantidade(adQtd, f.quantidade)) return false;
      }

      if (f.uf) {
        if (!adUF || adUF !== f.uf) return false;
      }

      if (fCidade && !adCidade.includes(fCidade)) return false;

      return true;
    });

    renderAnuncios(filteredAnuncios);
  }

  function limparFiltros() {
    document.querySelectorAll('input[name="categoria"]').forEach((r) => (r.checked = false));

    if (conservacaoSelect) conservacaoSelect.value = "";
    if (quantidadeSelect) quantidadeSelect.value = "";
    if (estadoSelect) estadoSelect.value = "";
    if (cidadeInput) cidadeInput.value = "";

    if (precoMinInput) precoMinInput.value = 0;
    if (precoMaxInput) precoMaxInput.value = 50000;
    if (precoMaxRange) precoMaxRange.value = 50000;

    filteredAnuncios = [...allAnuncios];
    renderAnuncios(filteredAnuncios);
  }

  function debounce(fn, delay = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }
  const aplicarFiltrosDebounced = debounce(() => aplicarFiltros(), 250);

  [conservacaoSelect, quantidadeSelect, estadoSelect, precoMinInput, precoMaxInput, precoMaxRange]
    .filter(Boolean)
    .forEach((el) => {
      el.addEventListener("change", aplicarFiltros);
      el.addEventListener("input", aplicarFiltros);
    });

  document.querySelectorAll('input[name="categoria"]').forEach((radio) => {
    radio.addEventListener("change", aplicarFiltros);
  });

  cidadeInput?.addEventListener("input", aplicarFiltrosDebounced);
  cidadeInput?.addEventListener("change", aplicarFiltros);

  applyBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    try {
      aplicarFiltros();
      closeFilter();
    } catch (err) {
      console.error("Erro no filtro:", err);
      alert("Erro ao aplicar filtro. Verifique o console.");
    }
  });

  clearBtn?.addEventListener("click", () => {
    limparFiltros();
  });

  async function carregarAnuncios() {
    try {
      const response = await fetch("/anuncie/api/anuncios");
      if (!response.ok) throw new Error("Erro HTTP " + response.status);

      const anuncios = await response.json();

      allAnuncios = Array.isArray(anuncios) ? anuncios : [];
      filteredAnuncios = [...allAnuncios];

      if (allAnuncios.length === 0) {
        contadorAnuncios.textContent = "Nenhum anúncio encontrado.";
        anunciosVazio?.classList.remove("hidden");
        gridAnuncios.innerHTML = "";
        return;
      }

      renderAnuncios(filteredAnuncios);

      aplicarFiltros();
    } catch (err) {
      console.error("Erro ao carregar anúncios:", err);
      contadorAnuncios.textContent = "Não foi possível carregar os anúncios.";
    }
  }

  carregarAnuncios();
});
