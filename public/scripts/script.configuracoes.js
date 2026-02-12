function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }

    input.value = value;
}

function maskCNPJ(input) {

    let value = input.value.replace(/\D/g, '');

    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');

    input.value = value;
}

function limparCamposEndereco() {
    document.getElementById("cidade").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("pais").value = "";
}

function validarSenhaNova(senha) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(senha);
}

function handleCEPChange(input) {
    const cepNumeros = (input.value || "").replace(/\D/g, "");

    if (cepNumeros.length === 0) {
        limparCamposEndereco();
    }
}
function maskCEP(input) {
    input.value = input.value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2');
}

async function buscarCEP() {
    const cepInput = document.getElementById("cep");
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert("CEP não encontrado");
            return;
        }

        document.getElementById("cidade").value = data.localidade || "";
        document.getElementById("estado").value = data.uf || "";
        document.getElementById("endereco").value = data.logradouro || "";
        document.getElementById("bairro").value = data.bairro || "";
        document.getElementById("pais").value = "Brasil";

    } catch (err) {
        alert("Erro ao buscar CEP");
    }
}

async function enviarConfiguracoes(formData) {
    const response = await fetch("/api/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.status === "validation_error") {
        result.errors.forEach(err => {
            const input = document.querySelector(`[name="${err.field}"]`);
            if (input) {
                input.classList.add("border-red-500");
            }
            alert(err.message);
        });
        return;
    }

    alert(result.message);
}

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    const confirmLogout = confirm("Tem certeza que deseja sair da sua conta?");
    if (!confirmLogout) return;

    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erro ao realizar logout");
      }

      window.location.href = "/login";
    } catch (err) {
      alert("Não foi possível sair da conta.");
    }
  });
}
