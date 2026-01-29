const btnAbrir = document.getElementById('botaoNovoAnuncio');
        const btnFechar = document.getElementById('botaoFecharModal');
        const modal = document.getElementById('telaNovoAnuncio');
        const form = document.getElementById('formAnuncio');

        btnAbrir.onclick = () => modal.style.display = 'flex';
        btnFechar.onclick = () => modal.style.display = 'none';

        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const dados = Object.fromEntries(formData);

            try {
                console.log("Enviando dados:", dados);
                alert("Dados capturados! Agora você precisa da rota POST no Node.js para salvar.");
                
                modal.style.display = 'none';
                form.reset();
            } catch (err) {
                alert("Erro ao salvar anúncio.");
            }
        };