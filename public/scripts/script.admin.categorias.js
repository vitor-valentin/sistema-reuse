import { toast } from "./utils/script.toast.js";

const formCategoria = document.getElementById("formCategoria");
let editingCategoryId = null;
let currentPage = 1;

window.toggleModal = function (mode = 'create') {
    const modal = document.getElementById('modalCategoria');
    const title = modal.querySelector('h2');
    const btn = modal.querySelector('button[type="submit"]');
    
    if (mode === 'create') {
        editingCategoryId = null;
        formCategoria.reset();
        title.innerText = "Criar Categoria";
        btn.innerText = "Criar Categoria";
    }

    modal.classList.toggle("hidden");
    modal.classList.toggle("flex");
    document.body.style.overflow = modal.classList.contains("hidden") ? 'auto' : 'hidden';
}

window.loadCategorias = async function (page = 1, search = '') {
    currentPage = page;
    const grid = document.getElementById('categoriesGrid');

    const searchInput = document.getElementById('globalSearch');
    const currentSearch = search || (searchInput ? searchInput.value : '');
    
    try {
        const response = await fetch(`/admin/categorias/list?page=${page}&limit=9&search=${currentSearch}`);
        const { categorias, totalPages, anunciosCount } = await response.json();

        if (!categorias || categorias.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center p-10 text-darkcyangrey">Nenhuma categoria encontrada.</div>';
            return;
        }

        grid.innerHTML = categorias.map(cat => renderCategoryCard(cat, anunciosCount[categorias.indexOf(cat)])).join('');
        renderPagination(totalPages, currentPage, currentSearch);
        
    } catch (err) {
        console.error('Erro:', err);
    }
}

window.editCategory = async function(id) {
    try {
        const res = await fetch(`/admin/categorias/get/${id}`);
        const data = await res.json();
        const cat = data.result;

        formCategoria.nome.value = cat.nome;
        formCategoria.descricao.value = cat.descricao;

        editingCategoryId = id;
        const modal = document.getElementById('modalCategoria');
        modal.querySelector('h2').innerText = "Editar Categoria";
        modal.querySelector('button[type="submit"]').innerText = "Salvar Alterações";
        
        toggleModal('edit');
    } catch(err) {
        toast.show("Erro ao carregar categoria", "error");
    }
}

window.deleteCategory = async function (id) {
    const confirm = await toast.confirm("Essa ação não pode ser revertida!");
    
    if(!confirm) return;

    try {
        const res = await fetch("/admin/categorias/delete", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id})
        });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error);

        loadCategorias();
        return toast.show("Categoria deletada com sucesso!");
    } catch(err) {
        return toast.show(`Erro ao deletar a categoria: ${err}`, "error");
    }
}

function renderCategoryCard(cat, anunciosCount) {
    return `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-cyangrey hover:shadow-md transition-shadow relative group">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-bold text-darkblue">${cat.nome}</h3>
                <div class="flex gap-3">
                    <i onclick="editCategory('${cat.idCategoria}')" class="fa-solid fa-pencil text-mainblue cursor-pointer hover:scale-110 transition-transform"></i>
                    <i onclick="deleteCategory('${cat.idCategoria}')" class="fa-solid fa-trash text-red cursor-pointer hover:scale-110 transition-transform"></i>
                </div>
            </div>
            <p class="text-darkcyangrey text-sm mb-6 line-clamp-2">${cat.descricao || 'Sem descrição.'}</p>
            
            <div class="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span class="text-xs text-darkcyangrey/60 uppercase font-semibold tracking-wider">Anúncios nesta categoria</span>
                <span class="text-xl font-bold text-darkblue">${anunciosCount[0].total || 0}</span>
            </div>
        </div>
    `;
}

function renderPagination(totalPages, current, search = '') {
    const container = document.getElementById('paginationControls');
    let html = '';

    const searchArg = `'${search}'`;

    html += `
        <button onclick="loadCategorias(${current - 1}, ${searchArg})" ${current === 1 ? 'disabled' : ''} 
            class="w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${current === 1 ? 'border-cyangrey text-darkblue/20 cursor-not-allowed' : 'border-cyangrey text-darkblue hover:bg-lightgray'}">
            <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === current;
        html += `
            <button onclick="loadCategorias(${i}, ${searchArg})" 
                class="w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-colors ${isActive ? 'bg-mainblue text-white' : 'border border-cyangrey bg-white text-darkblue hover:bg-lightgray'}">
                ${i}
            </button>
        `;
    }

    html += `
        <button onclick="loadCategorias(${current + 1}, ${searchArg})" ${current === totalPages ? 'disabled' : ''} 
            class="w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${current === totalPages ? 'border-cyangrey text-darkblue/20 cursor-not-allowed' : 'border-cyangrey text-darkblue hover:bg-lightgray'}">
            <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
    `;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadCategorias());

formCategoria.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formCategoria);
    const data = Object.fromEntries(formData.entries());

    const url = editingCategoryId ? `/admin/categorias/update/${editingCategoryId}` : '/admin/categorias/createCategory';
    const method = editingCategoryId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.errors ? json.errors[0] : json.error);

        toast.show(editingCategoryId ? "Categoria atualizada!" : "Categoria criada!");
        toggleModal();
        loadCategorias(currentPage);
    } catch (err) {
        toast.show(err, "error");
    }
});