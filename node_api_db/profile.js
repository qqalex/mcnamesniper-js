// Closed source, do not distribute
// Profile database for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET


const fs = require('fs').promises;


class profile {
    constructor(username, startTime, endTime) {
        this.username = username;
        this.startTime = startTime;
        this.endTime = endTime;
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
        await fs.access(`profiles/${username}.json`);
        return true;
    }
    catch {
        return false;
    }
}

async function read(username) {
    const bool = await _check(username);
    if (bool) {
        const jsonString = await fs.readFile(`profiles/${username}.json`, 'utf8', (err) => { _error(err); });
        const readProfile = JSON.parse(jsonString);
        return readProfile;
    }
    else {
        return false;
    }
}

async function write(profile) {
    const jsonString = JSON.stringify(profile, null, 2);
    const bool = await _check(profile.username)
    if(bool) {
        return true;
    }
    else {
        fs.writeFile(`profiles/${profile.username}.json`, jsonString);
        return false;
    }
}

async function remove(username) {
    const bool = await _check(username);
    if (bool) {
        fs.unlink(`profiles/${username}.json`);
        return true;
    }
    else {
        return false;
    }
}


module.exports = { profile, write, read, remove };
