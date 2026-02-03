fetch('/components/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;

    const btnAnuncie = document.getElementById('botaoAnuncie');
    const btnEntrar = document.getElementById('botaoEntrar');
    
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

    btnEntrar.addEventListener('click', function(){
      window.location.href = '/pages/login.html';
    });

    btnAnuncie.addEventListener('click', handleAnuncieClick);
  });

function exibirNotificacao(mensagem) {
  alert(mensagem);
}
