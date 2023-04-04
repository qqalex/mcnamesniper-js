// Closed source, do not distribute
// Profile database for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET


const fs = require('fs').promises;
const arrayBearerTokens = [];


async function numberOfMSA() {
    const files = await fs.readdir('msaccounts');
    return files.length+1;
}

class MSAccount {
    constructor(id, email, password, bearerToken, bearerExpiry, gamePassExpiration) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.bearerToken = bearerToken;
        this.bearerExpiry = bearerExpiry; // unix timestamp
        this.gamePassExpiration = gamePassExpiration; // unix timestamp
    }
}

function _error(err) {
    if (err) {
        console.error(err);
        return true;
    }
}

async function _check(username){
    try {
        await fs.access(`msaccounts/${username}.json`);
        return true;
    }
    catch {
        return false;
    }
}

async function read(username) {
    const bool = await _check(username);
    if (bool) {
        const jsonString = await fs.readFile(`msaccounts/${username}.json`, 'utf8', (err) => { _error(err); });
        const readProfile = JSON.parse(jsonString);
        return readProfile;
    }
    else {
        return false;
    }
}

async function write(profile) {
    const jsonString = JSON.stringify(profile, null, 2);
    const bool = await _check(profile.id);
    if (bool) {
        return true;
    }
    else {
        fs.writeFile(`msaccounts/${profile.id}.json`, jsonString);
        return false;
    }
}

async function _loadBearerTokens() {
    const limit = await numberOfMSA();
    for (i=0; i<limit; i++) {
        const msaAtIndex = await read(i);
        arrayBearerTokens.push(msaAtIndex);
    }
}

async function getValidBearerTokens(endTime) {
    _loadBearerTokens();
    const validBearerTokens = [];
    for (i=0; i<arrayBearerTokens.length; i++) {
        if (arrayBearerTokens[i].bearerExpiry > endTime) {
            validBearerTokens.push(arrayBearerTokens[i].bearerToken);
        }
    }
    return validBearerTokens;
}


module.exports = { MSAccount, write, read, getValidBearerTokens, numberOfMSA };
