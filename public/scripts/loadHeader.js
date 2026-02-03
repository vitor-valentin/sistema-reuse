fetch('/components/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;

    const btnAnuncie = document.getElementById('botaoAnuncie');
    const btnEntrar = document.getElementById('botaoEntrar');
    
    btnEntrar.addEventListener('click', function(){
      window.location.href = '/pages/login.html';
    });
  });

function exibirNotificacao(mensagem) {
  alert(mensagem);
}