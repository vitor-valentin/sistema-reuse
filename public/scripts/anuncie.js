const btnAbrir = document.getElementById('botaoNovoAnuncio');
const btnFechar = document.getElementById('botaoFecharModal');
const modal = document.getElementById('telaNovoAnuncio');
const form = document.getElementById('formAnuncio');
const fileInput = form.querySelector('input[name="imagens_produto"]');
const previewAnexos = document.getElementById('previewAnexos');

const MAX_FILES = 5;
let selectedFiles = [];
let previewUrls = [];

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
