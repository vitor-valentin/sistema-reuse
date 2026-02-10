document.addEventListener("DOMContentLoaded", () => {

  const contadorAnuncios = document.getElementById("contador-anuncios");
  const gridAnuncios = document.getElementById("listaAnuncios");
  const anunciosVazio = document.getElementById("anunciosVazio");

  if (!contadorAnuncios || !gridAnuncios) {
    console.error("IDs não encontrados no HTML");
    return;
  }

  function formatCurrency(value) {
    if (!value) return "A combinar";

    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
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

  async function carregarAnuncios() {
    try {

      const response = await fetch("/anuncie/api/anuncios");

      if (!response.ok) {
        throw new Error("Erro HTTP " + response.status);
      }

      const anuncios = await response.json();

      gridAnuncios.innerHTML = "";

      if (!anuncios || anuncios.length === 0) {
        contadorAnuncios.textContent = "Nenhum anúncio encontrado.";
        anunciosVazio?.classList.remove("hidden");
        return;
      }

      anunciosVazio?.classList.add("hidden");
      contadorAnuncios.textContent =
        `${anuncios.length} anúncios disponíveis`;

      anuncios.forEach((anuncio) => {
        const card = createCard(anuncio);
        gridAnuncios.appendChild(card);
      });

    } catch (err) {
      console.error("Erro ao carregar anúncios:", err);
      contadorAnuncios.textContent =
        "Não foi possível carregar os anúncios.";
    }
  }

  carregarAnuncios();
});
