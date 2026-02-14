import { toast } from "../utils/script.toast.js";

const header = document.getElementById("header");

async function loadHeader() {
    const res = await fetch("/components/admin.header.html");
    const html = await res.text();
    
    header.innerHTML = html;
    setPageTitle();
    setUserInfo();
    initGlobalSearch();
}

async function setPageTitle() {
    const pageTitle = document.getElementById("page-title");
    const route = window.location.pathname.split("/")[2];
    
    let title;
    switch(route) {
        case "dashboard":
            title = "Dashboard";
            break;
        case "usuarios":
            title = "Usuários do Sistema"
            break;
        case "categorias":
            title = "Categorias";
            break;
        case "pedidos":
            title = "Pedidos de Cadastro"
            break;
        default:
            title = "";
            break;
    }

    pageTitle.textContent = title;
}

async function setUserInfo() {
    const userPhoto = document.getElementById("user-photo");
    const username = document.getElementById("username");
    const userCargo = document.getElementById("user-cargo");

    try {
        const res = await fetch("/admin/api/getInfo");
        const json = await res.json();

        username.textContent = json.data.nome;
        userCargo.textContent = json.data.cargo;
        userPhoto.textContent = getInitials(json.data.nome);
    } catch (err) {
        console.log(err);
        toast.show("Erro ao buscar informações do usuário", "error");
    }
}

function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    const route = window.location.pathname.split("/")[2];

    switch(route) {
        case "usuarios":
            window.loadFunction = window.loadUsuarios;
            break;
        case "categorias":
            window.loadFunction = window.loadCategorias;
            break;
        case "pedidos":
            window.loadFunction = window.loadPedidos;
            break;
    }

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            if (typeof window.loadFunction === 'function') {
                window.loadFunction(1, searchTerm);
            }
        }, 300);
    });
}

function getInitials(name) {
    if(!name) return "";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
}

loadHeader();