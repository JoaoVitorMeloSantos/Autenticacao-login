// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const db = require('./db')
const userController = require('./userController')

app.use(cors());
app.use(express.json());

db.sync(() => console.log(`Banco de dados conectado: ${process.env.DB_NAME}`));

app.post('/api/cadastro', async (req, res) => {
    try {
        const newUser = await userController.createUser({
            username: req.body.username,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        });

        // Retorne um código de status 201 (Created) e os detalhes do usuário criado
        res.status(201).json(newUser);
    } catch (err) {
        // Se ocorrer um erro, forneça um código de status 400 (Bad Request) e uma mensagem de erro
        console.log('Erro no cadastro do usuário', JSON.stringify(err));
        res.status(400).json({ error: 'Erro no cadastro do usuário', details: err.message });
    }
});

app.post('/api/login', async (req, res, next) => {
    try {
        const user = await userController.authenticateUser({
            username: req.body.username,
            password: req.body.password
        });

        // Se a autenticação for bem-sucedida, você pode retornar os detalhes do usuário ou um token de autenticação.
        res.json({
            success: true,
            message: 'Autenticação bem-sucedida',
            user: {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin
                // Adicione outros campos conforme necessário
            }
        });
    } catch (err) {
        // Imprimir o erro completo para diagnóstico
        console.error('Erro na autenticação do usuário:', err);

        // Retornar uma resposta de erro adequada
        res.status(401).json({
            success: false,
            message: 'Falha na autenticação',
            error: err.message // Inclua a mensagem de erro para fornecer mais informações
        });
    }
});

app.delete('/users/:id', (req, res, next) => {
    userController.deleteUser(req.params.id).then((msg) => res.send(msg))
    .catch((err) => {
      console.log('Erro na consulta', JSON.stringify(err))
      return res.send(err)
    });
});

app.get('/users', (req, res, next) => {
    userController.listUsers().then((users) => res.send(users))
    .catch((err) => {
      console.log('Erro na consulta', JSON.stringify(err))
      return res.send(err)
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


