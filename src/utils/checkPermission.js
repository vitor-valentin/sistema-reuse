import { getAdmin } from "../models/admins.model.js"

export async function checkPermissionLevel(id) {
    const admin = await getAdmin(id);
    if(!admin || admin.length == 0) return null;

    const permissions = [];

    if(admin[0].pAdmin) permissions.push("ADMIN");
    if(admin[0].pGerenciarCategorias) permissions.push("MANAGE_CATEGORIES");
    if(admin[0].pGerenciarPedidos) permissions.push("MANAGE_SOLICITATIONS");

    return permissions;
}