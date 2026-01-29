import { maskInput, stripMaskNumber } from "./utils/script.masks.js";
import { saveStep, loadProgress, clearProgress } from "./utils/script.localstorage.js";
import { toast } from "./utils/script.toast.js";

document.addEventListener("DOMContentLoaded", () => {
    // Variables
    const pageDescription = document.getElementById("page-description");
    const forms = document.getElementById("register-forms").querySelectorAll("form");
    const selectors = document.getElementById("selectors").querySelectorAll("*");

    const pagesIndex = {
        "selector-company": {
            description: "PREENCHA AS INFORMAÇÕES",
            form: forms[0]
        },
        "selector-address": {
            description: "INSIRA O ENDEREÇO DA EMPRESA",
            form: forms[1]
        },
        "selector-documents": {
            description: "ENVIE OS DOCUMENTOS",
            form: forms[2]
        },
        "selector-terms": {
            description: "POLÍTICA DE PRIVACIDADE E TERMOS",
            form: forms[3]
        }
    };

    // Functions
    function handleRegisterForm(e, form) {
        e.preventDefault();

        if(form.id == "terms-form") return registerUser(e);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData)

        switch(form.id) {
            case "company-form":
                saveStep(0, data);
                break;
            case "address-form":
                saveStep(1, data);
                break;
            default:
                break;
        }

        nextStep();
    }

    function nextStep() {
        const nextPage = document.getElementById("selectors").querySelector(".bg-mainblue").nextElementSibling;
        changeStep(nextPage);
    }

    function changeStep(nextPage) {
        const currentPage = document.getElementById("selectors").querySelector(".bg-mainblue");
        const currentPageIndex = pagesIndex[currentPage.id];
        const nextPageIndex = pagesIndex[nextPage.id];
        
        currentPage.classList.remove("bg-mainblue");
        currentPage.classList.add("cursor-pointer");

        nextPage.classList.add("bg-mainblue");
        nextPage.classList.remove("cursor-pointer");

        togglePage(currentPageIndex.form);
        togglePage(nextPageIndex.form);

        pageDescription.textContent = nextPageIndex.description;
    }

    function togglePage(form) {
        form.classList.toggle("flex");
        form.classList.toggle("hidden");
    }

    function loadLastSession() {
        const progress = loadProgress();

        if(!progress) return;

        fillForms(progress);
    }

    function fillForms(progress) {
        for(let i = 0; i < 2; i++) {
            if(progress.steps[i]){
                Object.entries(progress.steps[i]).forEach(([name, value]) => {
                    const field = forms[i].elements[name];
                    if (!field) return;

                    field.value = value;
                });

                nextStep();
            }
        }
        
    }

    function getFileOrNull(formData, name) {
        const file = formData.get(name);
        return file instanceof File && file.size > 0 ? file : null;
    }

    function validateFile(file, maxSizeMB) {
        if (!file) throw new Error("Arquivo inválido!");

        const maxSize = maxSizeMB * 1024 * 1024;
        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de arquivo inválido: ${file.type}. Os tipos suportados são: webp, pdf, jpeg e png.`);
        }

        if (file.size > maxSize) {
            throw new Error(`Arquivo execede ${maxSizeMB}MB`);
        }

        return true;
    }

    async function generateKeyPair(password, salt) {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        const publicKeyBuffer = await crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
        );
        const publicKeyBase64 = toBase64(publicKeyBuffer);

        const privateKeyBuffer = await crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey
        );

        const baseKey = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const wrappingKey = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: 150_000,
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-GCM", length: 256},
            false,
            ["encrypt", "decrypt"]
        );

        return [publicKeyBase64, privateKeyBuffer, wrappingKey];
    }

    function toBase64(buffer) {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    async function registerUser(event) {
        event.preventDefault();

        const companyForm = new FormData(document.getElementById("company-form"));
        const addressForm = new FormData(document.getElementById("address-form"));
        const documentsForm = new FormData(document.getElementById("documents-form"));
        const termsForm = new FormData(document.getElementById("terms-form"));

        const data = {
            cnpj: stripMaskNumber(companyForm.get("cnpj")),
            razao_social: companyForm.get("razao-social"),
            nome_fantasia: companyForm.get("nome-fantasia"),
            email_corp: companyForm.get("email-corp"),
            telefone: stripMaskNumber(companyForm.get("telefone")),
            nome_resp: companyForm.get("nome-responsavel"),
            cpf_resp: stripMaskNumber(companyForm.get("cpf-responsavel")),
            senha: companyForm.get("senha"),
            cep: stripMaskNumber(addressForm.get("cep")),
            estado: addressForm.get("estado"),
            cidade: addressForm.get("cidade"),
            bairro: addressForm.get("bairro"),
            endereco: addressForm.get("endereco"),
            numero: addressForm.get("numero"),
            complemento: addressForm.get("complemento"),
            comprovante_end: getFileOrNull(documentsForm, "comprovante_end"),
            cartao_cnpj: getFileOrNull(documentsForm, "cartao_cnpj"),
            contrato_social: getFileOrNull(documentsForm, "contrato_social")
        };
        

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const [publicKeyBase64, privateKeyBuffer, wrappingKey] = await generateKeyPair(data.senha, salt);

        const encryptedPrivateKey = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            wrappingKey,
            privateKeyBuffer
        );

        data.publicKey = publicKeyBase64;
        data.privateKey = toBase64(encryptedPrivateKey);
        data.salt = toBase64(salt);
        data.iv = toBase64(salt);

        const formDataToSend = new FormData();

        for (const key in data) {
            if (data[key] !== null && !(data[key] instanceof File)) {
                formDataToSend.append(key, data[key]);
            }
        }

        formDataToSend.append("comprovante_end", data.comprovante_end);
        formDataToSend.append("cartao_cnpj", data.cartao_cnpj);
        if (data.contrato_social) {
            formDataToSend.append("contrato_social", data.contrato_social);
        }

        try {
            validateFile(data.comprovante_end, 8);
            validateFile(data.cartao_cnpj, 8);
            if(data.contrato_social) validateFile(data.contrato_social, 8);

            const res = await fetch("/registrar/api/sendSolicitation", {
                method: "POST",
                body: formDataToSend
            });

            if (res.status == 500) toast.show("Erro interno do sistema", "error");
            else console.log("enviado :)") //TODO: Mostrar página de suscesso
        } catch (err) {
            console.log(err);
            toast.show(err, "error");
        }
    }

    async function fillAddrByCep(cep) {
        const pureCep = cep.replace(/\D/g, '');
        if (pureCep.length != 8) return;

        const res = await fetch(`https://viacep.com.br/ws/${pureCep}/json/`);
        const json = await res.json();
        
        const estado = forms[1].querySelector('input[name="estado"]');
        const cidade = forms[1].querySelector('input[name="cidade"]');
        const bairro = forms[1].querySelector('input[name="bairro"]');
        const endereco = forms[1].querySelector('input[name="endereco"]');

        estado.value = json.estado;
        cidade.value = json.localidade;
        bairro.value = json.bairro;
        endereco.value = json.logradouro;
    }

    function fileUpload(event) {
        const inputId = event.target.id;
        const label = document.querySelector(`label[for=${inputId}]`);
        const span = label.querySelector('span');
        const file = event.target.files[0];

        try {
            validateFile(file, 8);

            span.textContent = file.name;
            label.classList.remove("text-darkblue");
            label.classList.add("text-darkblue/70");
            label.classList.add("bg-mainblue/5");           
        } catch(err) {
            event.preventDefault();
            toast.show(err, "error");
        }
    }

    // Mask necessary inputs
    maskInput(forms[0].querySelector("input[name='cnpj']"), "99.999.999/9999-99");
    maskInput(forms[0].querySelector("input[name='telefone']"), "(99) 99999-9999");
    maskInput(forms[0].querySelector("input[name='cpf-responsavel']"), "999.999.999-99");
    maskInput(forms[1].querySelector("input[name='cep']"), "99999-999");

    // Handle Event Listeners
    forms.forEach((form) => {
        form.addEventListener("submit", (e) => handleRegisterForm(e, form));
    });

    selectors.forEach((selector) => {
        selector.addEventListener("click", () => changeStep(selector));
    });

    forms[1].querySelector('input[name="cep"]').addEventListener("input", 
        async () => await fillAddrByCep(forms[1].querySelector('input[name="cep"]').value));

    forms[2].querySelectorAll('input[type="file"]').forEach((input) => {
        input.addEventListener("change", (e) => fileUpload(e));
    });

    loadLastSession();
});