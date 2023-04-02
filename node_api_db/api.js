// Closed source, do not distribute
// Middleware for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET


    // Import modules
const fs = require('fs');
const data = require('./db.js');
const https = require('https');
const express = require('express');

    // Define express app
const app = express();

    // Creating HTTPS server
const options = {
    key: fs.readFileSync('C:/Users/alex/Documents/apiCert/key.pem'),
    cert: fs.readFileSync('C:/Users/alex/Documents/apiCert/cert.pem')
}
const server = https.createServer(options, app);

    // Variables
const port = 443;

    // Request Auth Token
const apiAuthToken = 'HGkFWnMyfX8wMACS';


    // Functions
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
        let account = new data.profile(username, startTime, endTime);
        let bool = await data.write(account);
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
        let bool = await data.read(username);
        if (bool) {
            res.status(200);
            res.send(`Profile "${username}" does not exist`);
        }
        else {
            res.status(200);
            res.send(`Profile "${username}" exists`);
        }
    }
    else {
        res.status(401);
        res.send('Auth fail');
    }
}


    // Express API routes
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

app.post('/queue/snipe', (req, res) => {
    const auth = req.header('Token');
    const username = req.header('Username');
    const startTime = req.header('Start Time');
    const endTime = req.header('End Time');
    
    
})

server.listen(port, () => {
    console.log(`API started on port ${port}`);
})
