async function checkLogin() {
    const res = await fetch("/landingPage/check-login");
    const data = await res.json();
    if (data.loggedIn) {
        console.log("Usuário está logado!", data.id);
    } else {
        console.log("Usuário não está logado");
    }
}

checkLogin();