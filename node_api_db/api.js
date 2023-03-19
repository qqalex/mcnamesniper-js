const express = require('express');
const app = express();

app.get('/login', (req, res) => {
    const name =  req.header('Name');
    const password = req.header('Password');
    if (password === '123456') {
        const message = name ? `Hello, ${name}!` : 'Hello, World!';
        res.json({message: message});
    }
    else {
        res.sendStatus(401);
    }
});

app.post('/user', (req, res) => {
    const name = req.header('Name');
    const password = req.header('Password');
    res.json({message: `User "${name}" created!` });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
