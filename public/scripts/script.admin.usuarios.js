import { toast } from "./utils/script.toast.js";

const formUsuario = document.getElementById("formUsuario");
const inputSenha = document.getElementById('inputSenha');
const reqBox = document.getElementById('passwordRequirements');

let editingUserId = null;
let currentPage = 1;
let searchTimeout;

const getPasswordValidity = (val) => {
    return {
        length: val.length >= 8,
        upperlower: /[a-z]/.test(val) && /[A-Z]/.test(val),
        number: /[0-9]/.test(val),
        isEmpty: val.length === 0
    };
};

window.toggleModal = function (mode = 'create') {
    const modal = document.getElementById('modalNovoUsuario');
    const title = modal.querySelector('h2');
    const sub = modal.querySelector('p');
    const btn = modal.querySelector('button[type="submit"]');
    const inptSenha = modal.querySelector('#inputSenha');
    const checkbxs = modal.querySelectorAll("input[type='checkbox'");
    
    if (mode === 'create') {
        editingUserId = null;
        formUsuario.reset();
        title.innerText = "Criar Usuário";
        sub.innerText = "Adicione um novo usuário ao sistema.";
        btn.innerText = "Criar Usuário";
        inptSenha.placeholder = "Deixe em branco para gerar uma senha aleatória";
        checkbxs.forEach((check) => check.disabled = false);
    }

    modal.classList.toggle("hidden");
    modal.classList.toggle("flex");
    document.body.style.overflow = modal.classList.contains("hidden") ? 'auto' : 'hidden';
}

window.toggleAdmin = function () {
    const adminToggle = document.getElementById("adminToggle");
    const pedidosToggle = document.getElementById("pedidosToggle");
    const categoriasToggle = document.getElementById("categoriasToggle");

    pedidosToggle.checked = adminToggle.checked;
    categoriasToggle.checked = adminToggle.checked;

    pedidosToggle.disabled = !pedidosToggle.disabled;
    categoriasToggle.disabled = !categoriasToggle.disabled;
}

window.loadUsuarios = async function (page = 1, search = '') {
    currentPage = page;
    const tableBody = document.getElementById('usersTableBody');
    
    const searchInput = document.getElementById('globalSearch');
    const currentSearch = search || (searchInput ? searchInput.value : '');

    try {
        const response = await fetch(`/admin/usuarios/list?page=${page}&limit=10&search=${currentSearch}`);
        const { users, totalPages } = await response.json();

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-10 text-darkcyangrey">Nenhum resultado encontrado.</td></tr>';
            document.getElementById('paginationControls').innerHTML = '';
            return;
        }

        tableBody.innerHTML = users.map(user => renderUserRow(user)).join('');
        
        renderPagination(totalPages, currentPage, currentSearch);
        
    } catch (err) {
        console.error('Erro:', err);
    }
}

window.editUser = async function(id) {
    try {
        const res = await fetch(`/admin/usuarios/get/${id}`);
        const json = await res.json();
        const user = json.result;

        if(!res.ok) throw new Error();

        formUsuario.nome.value = user.nome;
        formUsuario.email.value = user.email;
        formUsuario.cargo.value = user.cargo;
        formUsuario.status.value = user.status ? "Ativo" : "Inativo";
        formUsuario.isAdmin.checked = user.pAdmin;
        formUsuario.manageCategories.checked = user.pAdmin ? true : user.pGerenciarCategorias;
        formUsuario.manageSolicitations.checked = user.pAdmin ? true : user.pGerenciarPedidos;

        formUsuario.manageCategories.disabled = formUsuario.isAdmin.checked;
        formUsuario.manageSolicitations.disabled = formUsuario.isAdmin.checked;

        formUsuario.senha.placeholder = "Deixe vazio para manter a senha atual";

        editingUserId = id;
        const modal = document.getElementById('modalNovoUsuario');
        modal.querySelector('h2').innerText = "Editar Usuário";
        modal.querySelector('button[type="submit"]').innerText = "Salvar Alterações";
        
        modal.classList.replace("hidden", "flex");
        document.body.style.overflow = 'hidden';

    } catch(err) {
        toast.show("Erro ao carregar dados do usuário", "error");
    }
}

window.deleteUser = async function (id) {
    const confirm = await toast.confirm("Essa ação não pode ser revertida!");
    
    if(!confirm) return;

    try {
        const res = await fetch("/admin/usuarios/delete", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id})
        });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error);

        loadUsuarios();
        return toast.show("Usuário deletado com sucesso!");
    } catch(err) {
        return toast.show(`Erro ao deletar o usuário: ${err}`, "error");
    }
}

function renderPagination(totalPages, current, search = '') {
    const container = document.getElementById('paginationControls');
    let html = '';

    const searchArg = `'${search}'`;

    html += `
        <button onclick="loadUsuarios(${current - 1}, ${searchArg})" ${current === 1 ? 'disabled' : ''} 
            class="w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${current === 1 ? 'border-cyangrey text-darkblue/20 cursor-not-allowed' : 'border-cyangrey text-darkblue hover:bg-lightgray'}">
            <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === current;
        html += `
            <button onclick="loadUsuarios(${i}, ${searchArg})" 
                class="w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-colors ${isActive ? 'bg-mainblue text-white' : 'border border-cyangrey bg-white text-darkblue hover:bg-lightgray'}">
                ${i}
            </button>
        `;
    }

    html += `
        <button onclick="loadUsuarios(${current + 1}, ${searchArg})" ${current === totalPages ? 'disabled' : ''} 
            class="w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${current === totalPages ? 'border-cyangrey text-darkblue/20 cursor-not-allowed' : 'border-cyangrey text-darkblue hover:bg-lightgray'}">
            <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
    `;

    container.innerHTML = html;
}

function renderUserRow(user) {
    const initial = user.nome.charAt(0).toUpperCase();
    const statusClass = user.status === 1 ? 'bg-lightgreen text-green' : 'bg-lightgray text-darkcyangrey border border-cyangrey';
    
    return `
        <tr class="hover:bg-lightgray transition-colors">
            <td class="p-5 flex items-center gap-3">
                <div class="w-10 h-10 bg-mainblue/10 text-mainblue flex items-center justify-center rounded-full font-bold">${initial}</div>
                <span class="text-darkblue font-medium">${user.nome}</span>
            </td>
            <td class="p-5 text-darkcyangrey">${user.email}</td>
            <td class="p-5 text-darkcyangrey">${user.cargo}</td>
            <td class="p-5">
                <span class="${statusClass} px-4 py-1.5 rounded-full text-xs font-bold">${user.status === 1 ? 'Ativo' : 'Inativo'}</span>
            </td>
            <td class="p-5 text-right space-x-4">
                <i onclick="editUser('${user.idUsuario}')" class="fa-solid fa-pencil text-mainblue cursor-pointer"></i>
                <i onclick="deleteUser('${user.idUsuario}')" class="fa-solid fa-trash text-red cursor-pointer"></i>
            </td>
        </tr>
    `;
}

inputSenha.addEventListener('input', (e) => {
    const val = e.target.value;
    const checks = getPasswordValidity(val);

    if (checks.isEmpty) {
        reqBox.classList.add('hidden');
        inputSenha.classList.remove('border-red', 'border-green');
        return;
    }

    reqBox.classList.remove('hidden');

    Object.keys(checks).forEach(key => {
        if (key === 'isEmpty') return;
        const el = document.getElementById(`req-${key}`);
        if (checks[key]) {
            el.classList.replace('text-red', 'text-green');
            el.innerHTML = `✓ ${el.innerText.substring(2)}`;
        } else {
            el.classList.replace('text-green', 'text-red');
            el.innerHTML = `✕ ${el.innerText.substring(2)}`;
        }
    });

    const isAllValid = checks.length && checks.upperlower && checks.number;
    inputSenha.classList.toggle('border-red', !isAllValid);
    inputSenha.classList.toggle('border-green', isAllValid);
});
inputSenha.addEventListener('blur', () => {
    const val = inputSenha.value;
    const checks = getPasswordValidity(val);
    const isAllValid = (checks.length && checks.upperlower && checks.number) || checks.isEmpty;

    if (isAllValid) {
        reqBox.classList.add('hidden');
        inputSenha.classList.remove('border-green', 'border-red');
    }
});

document.addEventListener('DOMContentLoaded', loadUsuarios());

formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (inputSenha.value.length > 0 && !getPasswordValidity(inputSenha.value)) {
        return toast.show("A senha não atende aos requisitos!", "error");
    }

    const formData = new FormData(formUsuario);
    const data = Object.fromEntries(formData.entries());
    
    data.isAdmin = formData.has('isAdmin');
    data.manageCategories = formData.has('manageCategories');
    data.manageSolicitations = formData.has('manageSolicitations');
    data.status = data.status === "Ativo";

    const url = editingUserId ? `/admin/usuarios/update/${editingUserId}` : '/admin/usuarios/createUser';
    const method = editingUserId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.errors ? json.errors[0] : json.error);

        toast.show(editingUserId ? "Usuário atualizado!" : "Usuário criado!");
        toggleModal();
        loadUsuarios(currentPage);
    } catch (err) {
        toast.show(err, "error");
    }
});