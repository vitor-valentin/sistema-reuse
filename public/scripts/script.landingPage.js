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

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'sua_senha',
    database: 'seu_banco'
};

app.get('/api/anuncios', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM tbanuncios');
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar banco de dados' });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));