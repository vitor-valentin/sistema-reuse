import { toast } from "./utils/script.toast.js";

const formatCNPJ = (v) => v?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
const formatCPF = (v) => v?.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const formatCEP = (v) => v?.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
const formatPhone = (v) => {
    if(!v) return "";
    const r = v.replace(/\D/g, "");
    if (r.length > 10) return r.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    return r.replace(/^(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
};

let currentPedidoId = null;
let currentPage = 1;

window.loadPedidos = async function (page = 1, search = '') {
    currentPage = page;
    const list = document.getElementById('pedidosList');

    const searchInput = document.getElementById('globalSearch');
    const currentSearch = search || (searchInput ? searchInput.value : '');

    try {
        const response = await fetch(`/admin/pedidos/list?page=${page}&limit=10&search=${currentSearch}`);
        const { pedidos, totalPages, pendingCount } = await response.json();

        document.getElementById('pendingCount').innerText = pendingCount;

        if (!pedidos || pedidos.length === 0) {
            list.innerHTML = '<div class="bg-white p-10 rounded-2xl text-center border border-cyangrey text-darkcyangrey">Nenhum pedido pendente no momento.</div>';
            return;
        }

        list.innerHTML = pedidos.map(p => renderPedidoCard(p)).join('');
        renderPagination(totalPages, currentPage, currentSearch);
    } catch (err) { console.error(err); }
}

window.viewDetails = async function(id) {
    currentPedidoId = id;
    const res = await fetch(`/admin/pedidos/get/${id}`);
    const { result: p } = await res.json();

    const baseUrl = "/admin/pedidos/documents/";
    const urlDocEndereco = `comprovante_end/`;
    const urlDocCnpj = `cartao_cnpj/`;
    const urlDocContrato = p.docContratoSocial ? `contrato_social/` : false;

    const container = document.getElementById('detalhesConteudo');
    
    const infoRow = (label, value) => `
        <div class="flex justify-between items-center text-sm border-b border-gray-50 py-1">
            <span class="text-darkcyangrey">${label}</span>
            <span class="font-semibold text-darkblue text-right">${value || '---'}</span>
        </div>
    `;

    container.innerHTML = `
        <div class="bg-white p-5 rounded-2xl border border-cyangrey space-y-3">
            <h3 class="text-sm font-bold text-darkblue mb-4">Informações da Empresa</h3>
            ${infoRow('Razão Social', p.razaoSocial)}
            ${infoRow('Nome Fantasia', p.nomeFantasia)}
            ${infoRow('CNPJ', formatCNPJ(p.cnpj))}
        </div>

        <div class="bg-white p-5 rounded-2xl border border-cyangrey mt-4 space-y-3">
            <h3 class="text-sm font-bold text-darkblue mb-4">Responsável da Empresa</h3>
            ${infoRow('Nome', p.nomeResponsavel)}
            ${infoRow('CPF', formatCPF(p.cpfResponsavel))}
        </div>

        <div class="bg-white p-5 rounded-2xl border border-cyangrey mt-4 space-y-3">
            <h3 class="text-sm font-bold text-darkblue mb-4">Contato</h3>
            ${infoRow('E-mail', p.emailCorporativo)}
            ${infoRow('Telefone', formatPhone(p.foneCorporativo))}
        </div>

        <div class="bg-white p-5 rounded-2xl border border-cyangrey mt-4 space-y-3">
            <h3 class="text-sm font-bold text-darkblue mb-4">Endereço Empresarial</h3>
            ${infoRow('CEP', formatCEP(p.cepEmpresa))}
            ${infoRow('Estado', p.estado)}
            ${infoRow('Cidade', p.cidade)}
            ${infoRow('Bairro', p.bairro)}
            ${infoRow('Endereço Completo', p.endereco)}
            ${infoRow('Complemento', p.complemento)}
        </div>

        <div class="mt-6">
            <h3 class="text-xs font-black uppercase tracking-widest text-darkcyangrey/60 mb-4">Documentos Enviados</h3>
            <div class="space-y-3">
                ${renderDocRow('Comprovante de Endereço', 
                    (baseUrl + urlDocEndereco + p.idEmpresa), 
                    true, 
                    p.docComprovanteEndereco.split('.')[1])}
                ${renderDocRow('Cartão CNPJ', 
                    (baseUrl + urlDocCnpj + p.idEmpresa), 
                    true, 
                    p.docCartaoCNPJ.split('.')[1])}
                ${renderDocRow('Contrato Social', 
                    urlDocContrato ? (baseUrl + urlDocContrato + p.idEmpresa) : false, 
                    false,
                    p.docContratoSocial ? p.docContratoSocial.split('.') : false)}
            </div>
        </div>
    `;

    document.getElementById('modalDetalhesPedido').classList.replace('hidden', 'flex');
}

window.openDoc = async function(url) {
    const container = document.getElementById('docContainer');
    container.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fa-solid fa-circle-notch animate-spin text-3xl text-mainblue"></i></div>';
    
    document.getElementById('docViewer').classList.replace('hidden', 'flex');

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const isPdf = blob.type === 'application/pdf';

        if (isPdf) {
            // Adicionamos style="pointer-events: all;" explicitamente
            container.innerHTML = `
                <iframe src="${blobUrl}#toolbar=0&navpanes=0" 
                    class="w-full h-full border-none" 
                    style="pointer-events: all;">
                </iframe>
            `;
        } else {
            // Para imagens, o bloqueio de clique direito no pai já funciona
            container.innerHTML = `
                <div class="w-full h-full flex items-center justify-center p-4 bg-gray-100 overflow-auto">
                    <img src="${blobUrl}" class="max-w-full max-h-full object-contain shadow-lg" draggable="false">
                </div>
            `;
        }

        window.currentBlobUrl = blobUrl;
        document.body.style.overflow = 'hidden';
    } catch (err) {
        container.innerHTML = `<div class="text-red p-10 text-center font-bold">Erro ao carregar documento.</div>`;
    }
}

window.closeDoc = function() {
    document.getElementById('docViewer').classList.replace('flex', 'hidden');
    if (window.currentBlobUrl) {
        URL.revokeObjectURL(window.currentBlobUrl);
    }
    document.body.style.overflow = 'auto';
}

window.updateStatus = async function (type) {
    const types = [
        "aprovado",
        "recusado"
    ];
    if(!types.includes(type)) return;
    if(!currentPedidoId) return;

    const data = {
        id: currentPedidoId,
        status: type
    };

    try {
        const res = await fetch('/admin/pedidos/update', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if(!res.ok) throw new Error(json.errors ? json.errors[0] : json.error);

        toggleModal();
        loadPedidos();
        toast.show("A solicitação foi atualizada com sucesso! Foi enviado um email notificando o usuário");
    } catch (err) {
        toast.show(err, "error");
    }
}

function renderPedidoCard(p) {
    return `
        <div onclick="viewDetails('${p.idEmpresa}')" class="bg-white p-6 rounded-2xl border border-cyangrey hover:border-mainblue transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6 relative">
            <div class="w-14 h-14 bg-mainblue/5 text-mainblue rounded-xl flex items-center justify-center text-2xl">
                <i class="fa-solid fa-building"></i>
            </div>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 class="font-bold text-darkblue">${p.razaoSocial}</h4>
                    <p class="text-sm text-darkcyangrey">${p.nomeResponsavel}</p>
                </div>
                <div class="text-sm text-darkcyangrey">
                    <p><i class="fa-solid fa-address-card mr-2 opacity-50"></i>CNPJ: ${formatCNPJ(p.cnpj)}</p>
                    <p><i class="fa-solid fa-envelope mr-2 opacity-50"></i>${p.emailCorporativo}</p>
                </div>
                <div class="text-sm text-darkcyangrey flex flex-col justify-center">
                    <p><i class="fa-solid fa-calendar mr-2 opacity-50"></i>Solicitado em ${new Date(p.dataCadastro).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            <span class="absolute top-4 right-4 bg-lightyellow text-yellow text-[10px] uppercase font-black px-2 py-1 rounded">Pendente</span>
        </div>
    `;
}

function renderPagination(totalPages, current, search = '') {
    const container = document.getElementById('paginationControls');
    let html = '';

    const searchArg = `'${search}'`;

    html += `
        <button onclick="loadPedidos(${current - 1}, ${searchArg})" ${current === 1 ? 'disabled' : ''} 
            class="w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${current === 1 ? 'border-cyangrey text-darkblue/20 cursor-not-allowed' : 'border-cyangrey text-darkblue hover:bg-lightgray'}">
            <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === current;
        html += `
            <button onclick="loadPedidos(${i}, ${searchArg})" 
                class="w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-colors ${isActive ? 'bg-mainblue text-white' : 'border border-cyangrey bg-white text-darkblue hover:bg-lightgray'}">
                ${i}
            </button>
        `;
    }

    html += `
        <button onclick="loadPedidos(${current + 1}, ${searchArg})" ${current === totalPages ? 'disabled' : ''} 
            class="w-9 h-9 flex items-center justify-center border rounded-lg transition-colors ${current === totalPages ? 'border-cyangrey text-darkblue/20 cursor-not-allowed' : 'border-cyangrey text-darkblue hover:bg-lightgray'}">
            <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
    `;

    container.innerHTML = html;
}

function renderDocRow(label, url, required, ext) {
    if (!url && !required) return '';

    if (!url && required) {
        return `
            <div class="flex items-center justify-between p-4 bg-red/5 rounded-xl border border-red/20">
                <p class="text-sm font-bold text-red">Documento Obrigatório Faltando: ${label}</p>
            </div>
        `;
    }

    const isPdf = ext === 'pdf' || url.toLowerCase().endsWith('.pdf');
    const icon = isPdf ? 'pdf' : 'image';
    const iconColor = isPdf ? 'text-red' : 'text-mainblue';
    const type = isPdf ? 'PDF' : 'IMAGEM';

    return `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-cyangrey">
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-file-${icon} ${iconColor} text-xl"></i>
                <div>
                    <p class="text-sm font-bold text-darkblue">${label}</p>
                    <p class="text-[10px] text-darkcyangrey uppercase">${type}</p>
                </div>
            </div>
            <button onclick="openDoc('${url}')" class="text-mainblue font-bold text-sm hover:underline">Visualizar</button>
        </div>
    `;
}

window.toggleModal = () => document.getElementById('modalDetalhesPedido').classList.replace('flex', 'hidden');

document.addEventListener('DOMContentLoaded', loadPedidos());