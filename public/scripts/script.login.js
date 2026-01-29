import { toast } from "./utils/script.toast.js";

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

            if (res.status == 404) toast.show("Credenciais Inválidas", "error");
            else if (res.status == 500)
                toast.show("Erro interno do sistema", "error");
            else {
                window.location.href = "http://localhost:8080/";
            }
        } catch (err) {
            toast.show(err, "error");
        }
    });
});
