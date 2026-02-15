const sidebar = document.getElementById("sidebar");

async function loadSidebar() {
    const res = await fetch("/components/admin.sidebar.html");
    const html = await res.text();
    
    sidebar.innerHTML = html;
    checkPermissions();
    applyStyle();
}

async function checkPermissions() {
    const res = await fetch("/admin/permissions");
    const json = await res.json();
    const permissions = json.permissions;
    
    if(permissions.includes("ADMIN")) return;
    
    if (!permissions.includes("MANAGE_CATEGORIES"))
        document.getElementById("categorias").remove();
    if (!permissions.includes("MANAGE_SOLICITATIONS"))
        document.getElementById("pedidos").remove();

    document.getElementById("usuarios").remove();
}

async function applyStyle() {
    const route = window.location.pathname.split("/")[2];
    
    let element;
    switch(route) {
        case "dashboard":
            element = document.getElementById("dashboard");
            break;
        case "usuarios":
            element = document.getElementById("usuarios");
            break;
        case "categorias":
            element = document.getElementById("categorias");
            break;
        case "pedidos":
            element = document.getElementById("pedidos");
            break;
    }

    element.classList.remove("text-darkgray", "hover:bg-darkgray/10");
    element.classList.add("bg-mainblue/15", "font-semibold", "text-mainblue");
}

function toggleSidebar() {
    const sidebarAside = document.getElementById("sidebarAside");
    const overlay = document.getElementById("sidebarOverlay");
    
    sidebarAside.classList.toggle("-translate-x-full");
    
    if(overlay) {
        overlay.classList.toggle("hidden");
    }
}

loadSidebar();