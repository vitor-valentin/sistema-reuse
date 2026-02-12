const btnAbrir = document.getElementById('botaoNovoAnuncio');
const btnFechar = document.getElementById('botaoFecharModal');
const modal = document.getElementById('telaNovoAnuncio');
const form = document.getElementById('formAnuncio');

const fileInput = form.querySelector('input[name="imagens_produto"]');
const previewAnexos = document.getElementById('previewAnexos');

const MAX_FILES = 5;
let selectedFiles = [];
let previewUrls = [];

const inputPreco = document.getElementById("valorTotal");
const MAX = 50000;

if (inputPreco) {
  inputPreco.addEventListener("input", () => {
    let raw = inputPreco.value.replace(/\D/g, "");

    let valor = Number(raw) / 100;

    if (valor > MAX) {
      valor = MAX;
    }

    inputPreco.value = valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  });
}



function clampNonNegativeNumber(el, { integer = false } = {}) {
  if (!el) return;

  let v = (el.value ?? "").toString();

  v = v.replace(/[eE+\-]/g, "");
  v = v.replace(",", ".");
  v = v.replace(/[^0-9.]/g, "");

  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");

  if (v === "") {
    el.value = "";
    return;
  }

  let num = Number(v);
  if (!Number.isFinite(num) || num < 0) num = 0;
  if (integer) num = Math.floor(num);

  el.value = num.toString();
}

function attachNonNegativeNumeric(el, opts) {
  if (!el) return;

  el.addEventListener("keydown", (e) => {
    const blocked = ["e", "E", "+", "-"];
    if (blocked.includes(e.key)) e.preventDefault();
  });

  el.addEventListener("input", () => clampNonNegativeNumber(el, opts));
  el.addEventListener("blur", () => clampNonNegativeNumber(el, opts));

  el.setAttribute("min", "0");
}

function stripHtmlTags(text) {
  return text.replace(/<[^>]*>/g, "");
}

function attachNoHtml(el) {
  if (!el) return;

  el.addEventListener("keydown", (e) => {
    if (e.key === "<" || e.key === ">") e.preventDefault();
  });

  el.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    const clean = stripHtmlTags(text);
    document.execCommand("insertText", false, clean);
  });

  el.addEventListener("input", () => {
    const clean = stripHtmlTags(el.value);
    if (clean !== el.value) el.value = clean;
  });

  el.addEventListener("drop", (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text");
    el.value = (el.value || "") + stripHtmlTags(text);
  });
}

function digitsToBRL(digits) {
  const num = Number(digits) / 100;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function attachCurrencyMask(input) {
  if (!input) return;

  try {
    input.type = "text";
  } catch (_) { }

  input.setAttribute("inputmode", "numeric");
  input.setAttribute("autocomplete", "off");

  const applyMask = () => {
    let digits = input.value.replace(/\D/g, "");

    if (!digits) {
      input.value = "";
      return;
    }

    if (digits.length > 12) digits = digits.slice(0, 12);

    input.value = digitsToBRL(digits);
  };

  input.addEventListener("input", applyMask);

  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    let digits = text.replace(/\D/g, "");
    if (digits.length > 12) digits = digits.slice(0, 12);
    input.value = digits ? digitsToBRL(digits) : "";
  });

  input.addEventListener("blur", applyMask);
}

function brlToNumberString(masked) {
  const digits = (masked || "").replace(/\D/g, "");
  if (!digits) return "";
  return (Number(digits) / 100).toFixed(2);
}

(function setupValidations() {
  if (!form) return;

  const valorTotal = form.querySelector('[name="valorTotal"]');
  const quantidade = form.querySelector('[name="quantidade"]');
  const pesoTotal = form.querySelector('[name="pesoTotal"]');

  attachCurrencyMask(valorTotal);

  attachNonNegativeNumeric(quantidade, { integer: true });
  attachNonNegativeNumeric(pesoTotal, { integer: false });

  attachNoHtml(form.querySelector('[name="origem"]'));
  attachNoHtml(form.querySelector('[name="composicao"]'));
  attachNoHtml(form.querySelector('[name="descricao"]'));
})();

function updateFileInput() {
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach((file) => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;
}

function clearPreviews() {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
  previewAnexos.innerHTML = '';
}

function renderPreviews() {
  clearPreviews();
  selectedFiles.forEach((file, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-24 h-24 rounded-xl overflow-hidden border border-stronggray/40 bg-gray-100';

    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    previewUrls.push(url);
    img.src = url;
    img.alt = file.name;
    img.className = 'w-full h-full object-cover';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'absolute -top-1 -right-1 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center';
    removeBtn.setAttribute('aria-label', `Remover ${file.name}`);
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => {
      selectedFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
      updateFileInput();
      renderPreviews();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    previewAnexos.appendChild(wrapper);
  });
}

fileInput.addEventListener('change', (event) => {
  const incomingFiles = Array.from(event.target.files);
  const availableSlots = MAX_FILES - selectedFiles.length;

  if (availableSlots <= 0) {
    alert('Você já adicionou o número máximo de imagens.');
    fileInput.value = '';
    return;
  }

  selectedFiles = selectedFiles.concat(incomingFiles.slice(0, availableSlots));

  if (incomingFiles.length > availableSlots) {
    alert(`Apenas ${MAX_FILES} imagens são permitidas. As demais foram ignoradas.`);
  }

  updateFileInput();
  renderPreviews();
});

btnAbrir.onclick = () => {
  modal.style.display = 'flex';
};

btnFechar.onclick = () => {
  modal.style.display = 'none';
};

form.onsubmit = async (e) => {
  e.preventDefault();

  clampNonNegativeNumber(form.querySelector('[name="quantidade"]'), { integer: true });
  clampNonNegativeNumber(form.querySelector('[name="pesoTotal"]'), { integer: false });

  const origem = form.querySelector('[name="origem"]');
  const composicao = form.querySelector('[name="composicao"]');
  const descricao = form.querySelector('[name="descricao"]');

  if (origem) origem.value = stripHtmlTags(origem.value || "");
  if (composicao) composicao.value = stripHtmlTags(composicao.value || "");
  if (descricao) descricao.value = stripHtmlTags(descricao.value || "");

  const valorInput = form.querySelector('[name="valorTotal"]');
  if (valorInput && valorInput.value) {
    valorInput.value = brlToNumberString(valorInput.value);
  }

  const formData = new FormData(form);

  try {
    const response = await fetch('/anuncie', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao salvar anúncio.');
    }

    const result = await response.json();
    alert(result.message || 'Anúncio publicado com sucesso!');

    modal.style.display = 'none';
    form.reset();
    selectedFiles = [];
    updateFileInput();
    renderPreviews();
  } catch (err) {
    alert(err.message || 'Erro ao salvar anúncio.');
  }
};
