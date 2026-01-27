document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login");
    const loginForm = document.getElementById("form-login");

    loginButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const form = new FormData(loginForm);
        const data = {
            login: form.get("login"),
            password: form.get("senha"),
        };

        try {
            const res = await fetch("/login/api/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            // TODO: PUT NOTIFICATIONS HERE ;)
            if (res.status == 404) console.error("Credenciais Inválidas :(");
            else if (res.status == 500)
                console.error("Erro interno do sistema :(");
            else {
                console.log("LOGADO :)");
                // TODO: REDIRECT TO MAIN PAGE
            }
        } catch (err) {
            //TODO: PUT NOTIFICATION HERE ;)
            console.error("Deu merda em: ", err);
        }
    });
});
