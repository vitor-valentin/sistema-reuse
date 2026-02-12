window.toggleModal = function () {
    const modal = document.getElementById('modalNovoUsuario');

    modal.classList.toggle("hidden");
    modal.classList.toggle("flex");

    if(document.body.style.overflow === "hidden") document.body.style.overflow = 'auto';
    else document.body.style.overflow = 'hidden';
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