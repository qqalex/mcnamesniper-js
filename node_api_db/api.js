// Closed source, do not distribute
// API for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET

// General imports
require('dotenv').config();
const fs = require('fs');
const { exec } = require('child_process');

// API Related imports
const https = require('https');
const express = require('express');
const app = express();

// Custom imports
const profileDB = require('./profile');
const msaDB = require('./msa');


const port = process.env.PORT;
const apiAuthToken = process.env.API_TOKEN;
const bearerEndpoint = process.env.BEARER_GET_ENDPOINT_URL;

const options = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
}
const server = https.createServer(options, app);


function _authCheck(auth) {
    if (auth === apiAuthToken) {
        return true;
    }
    else {
        return false;
    }
}

async function _profileAdd(auth, username, startTime, endTime, res) {
    if (!_authCheck(auth)) {
        res.status(401);
        res.send('Auth fail');
    }
    else {
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
}

async function _profileRemove(auth, username, res) {
    if (!_authCheck(auth)) {
        res.status(401);
        res.send('Auth fail');
    }
    else {
        const bool = await profileDB.remove(username);
        res.status(200);
        if (!bool) {
            res.send(`Profile "${username}" doesn't exist`);
        }
        else {
            res.send(`Profile "${username}" deleted`);
        }
    }
}

async function _profileRead(auth, username, res) {
    if (!_authCheck(auth)) {
        res.status(401);
        res.send('Auth fail');
    }
    else {
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
}

async function _snipeAdd(auth, username, bearerGetURL, startTime, endTime, res) {
    if (!_authCheck(auth)) {
        res.status(401);
        res.send('Auth fail');
    }
    else {
        exec(`./sniper ${username} ${startTime} ${endTime} ${bearerGetURL}`)
        res.status(200);
        res.send('Snipe added');
    }
}

async function _msaAdd(email, password, bearerToken, bearerExpiry, gamePassExpiration, res) {
    const id = await msaDB.numberOfMSA();
    const msAccount = new msaDB.MSAccount(id, email, password, bearerToken, bearerExpiry, gamePassExpiration);
    await msaDB.write(msAccount);
    res.status(200);
    res.send('MSA Account Added');
}


app.post('/profile/add', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');
    const startTime = req.header('StartTime');
    const endTime = req.header('EndTime');

    _profileAdd(auth, username, startTime, endTime, res);
})

app.post('/profile/remove', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');

    _profileRemove(auth, username, res);
})

app.get('/profile/read', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');

    _profileRead(auth, username, res);
})

app.post('/msa/add', (req, res) => {
    const auth = req.header('Token');
    const email = req.header('Email');
    const password = req.header('Password');
    const bearerToken = req.header('BearerToken');
    const bearerExpiry = req.header('BearerExpiry'); // unix timestamp
    const gamePassExpiration = req.header('GamePassExpiration'); // unix timestamp

    if (!_authCheck(auth)) {
        res.status(401);
        res.send('Auth fail');
    }
    else {
        _msaAdd(email, password, bearerToken, bearerExpiry, gamePassExpiration, res);
    }
})

app.post('/snipe/add', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');
    const startTime = req.header('StartTime');
    const endTime = req.header('EndTime');

    _snipeAdd(auth, username, bearerEndpoint, startTime, endTime, res);
})

app.get('/bearers/get', (req, res) => {
    const auth = req.header('Token');

    if (!_authCheck(auth)) {
        res.status(401);
        res.send('Auth fail');
    }
    else {
        msaDB.getBearerTokens().then((bearers) => {
            res.status(200);
            res.send(bearers);
        })
    }
})


server.listen(port, () => {
    console.log(`API started on port ${port}`);
})
