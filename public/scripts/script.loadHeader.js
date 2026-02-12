fetch('/components/header.html')
  .then(response => response.text())
  .then(async (data) => {
    document.getElementById('header-placeholder').innerHTML = data;

    const iconeUsuario = document.getElementById("userIcon");

    if (iconeUsuario) {
      iconeUsuario.addEventListener("click", () => {
        window.location.href = "/pages/configuracoes.html";
      });
    }

    const btnAnuncie = document.getElementById('botaoAnuncie');
    const btnEntrar = document.getElementById('botaoEntrar');
    const logo = document.getElementById('logoRetorna');

    async function handleAnuncieClick() {
      try {
        const response = await fetch('/auth/check');
        const data = await response.json();

        if (data.loggedIn) {
          window.location.href = '/anuncie/novo';
          return;
        }

        alert('Você precisa estar logado para anunciar.');
        window.location.href = '/pages/login.html';
      } catch (err) {
        alert('Não foi possível verificar o login. Tente novamente.');
      }
    }

    btnEntrar?.addEventListener('click', () => {
      window.location.href = '/pages/login.html';
    });

    btnAnuncie?.addEventListener('click', handleAnuncieClick);

    logo?.addEventListener('click', () => {
      window.location.href = '/';
    });
    await atualizarHeader();
  });

function exibirNotificacao(mensagem) {
  alert(mensagem);
}

async function verificarLogin() {
  try {
    const r = await fetch("/auth/check", { credentials: "include" });
    if (!r.ok) return false;
    const d = await r.json();
    return d.loggedIn === true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function atualizarHeader() {
  const botaoEntrar = document.getElementById("botaoEntrar");
  const iconeUser = document.getElementById("userIcon");
  const iconeNotificacao = document.getElementById("notificacoes")

  if (!botaoEntrar || !iconeUser) {
    console.warn("Header: botaoEntrar ou userIcon não encontrado no DOM");
    return;
  }

  const logado = await verificarLogin();

  if (logado) {
    iconeNotificacao.style.display = "inline-block"
    botaoEntrar.style.display = "none";
    iconeUser.style.display = "inline-block";
  } else {
    iconeNotificacao.style.display = "none"
    botaoEntrar.style.display = "inline-block";
    iconeUser.style.display = "none";
  }
}
