// Closed source, do not distribute
// MSA database for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET


const fs = require('fs').promises;

class MSAccounts {
    constructor() {
        this.array = [];
        this.valid = [];
    }
}

class MSAccount {
    constructor(id, email, password, bearerToken, bearerExpiry, gamePassExpiration) {
        this.id = id;                                   // int (index)
        this.email = email;                             // string
        this.password = password;                       // string
        this.bearerToken = bearerToken;                 // string
        this.bearerExpiry = bearerExpiry;               // unix timestamp
        this.gamePassExpiration = gamePassExpiration;   // unix timestamp
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

async function numberOfMSA() {
    const files = await fs.readdir('msaccounts');
    return files.length+1;
}

async function _loadBearerTokens(array) {
    const limit = await numberOfMSA();
    for (i=0; i<limit; i++) {
        const msaAtIndex = await read(i);
        array.push(msaAtIndex);
        return array
    }
}

async function getBearerTokens(endTime) {
    const accounts = new MSAccounts();
    accounts.array = await _loadBearerTokens(accounts.array);
    for (MSAccount in accounts.array) {
        if (MSAccount.bearerExpiry > endTime) {
            accounts.valid.push(MSAccount.bearerToken);
        }
    }
    return accounts.valid;
}


module.exports = { MSAccount, read, write, getBearerTokens, numberOfMSA };
