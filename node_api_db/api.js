// Closed source, do not distribute
// API for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET


const profileDB = require('./profileDB.js');
const msaDB = require('./msaDB.js');

const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();


const options = {
    key: fs.readFileSync('C:/Users/alex/Documents/apiCert/key.pem'),
    cert: fs.readFileSync('C:/Users/alex/Documents/apiCert/cert.pem')
}
const server = https.createServer(options, app);

const port = 443;
const apiAuthToken = 'HGkFWnMyfX8wMACS';


function _authCheck(auth) {
    if (auth === apiAuthToken) {
        return true;
    }
    else {
        return false;
    }
}

async function _profileAdd(auth, username, startTime, endTime, res) {
    if (_authCheck(auth)) {
        const account = new profileDB.profile(username, startTime, endTime);
        const bool = await profileDB.write(account);
        res.status(200);
        if (bool) {
            res.send(`Profile "${username}" already exists`);
        }
        else {
            res.send(`Profile "${username}" created`);
        }
    }
    else {
        res.status(401);
        res.send('Auth fail');
    }
}

async function _profileRead(auth, username, res) {
    if (_authCheck(auth)) {
        const bool = await profileDB.read(username);
        if (bool) {
            res.status(200);
            res.send(bool);
        }
        else {
            res.status(200);
            res.send(`Profile "${username}" does not exist`);
        }
    }
    else {
        res.status(401);
        res.send('Auth fail');
    }
}


app.post('/profile/add', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');
    const startTime = req.header('StartTime');
    const endTime = req.header('EndTime');

    _profileAdd(auth, username, startTime, endTime, res);
})

app.get('/profile/read', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');

    _profileRead(auth, username, res);
})

app.post('/snipe/add', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');
    const startTime = req.header('Start Time');
    const endTime = req.header('End Time');
    
    const bearerTokens = msaDB.getValidBearerTokens(endTime);
})

app.post('/snipe/remove', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');
})

app.post('/snipe/list', (req, res) => {
    const auth = req.header('Token');
})


server.listen(port, () => {
    console.log(`API started on port ${port}`);
})
