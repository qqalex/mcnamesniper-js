// Closed source, do not distribute
// Database for internal "Quick Brown Fox" API
// Written by Alex "qqalex" of Minecat.NET


// Import modules
const fs = require('fs');


// Profile constructor
class profile {
    constructor(username, startTime, endTime) {
        this.username = username;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

// Error callback function
function error(err) {
    if (err) {
        console.error(err);
        return true;
    }
}

// Database read function
async function read(username) {
    if (check(username) === false) {
        fs.readFileSync(`profiles/${username}.json`, 'utf8', (err) => { error(err); });
        return false;
    }
    else {
        return true;
    }
}

// Database write function
async function write(profile) {
    let jsonString = JSON.stringify(profile, null, 2);
    let bool = fs.existsSync(`profiles/${profile.username}.json`);
    if (bool) {
        return bool
    }
    fs.writeFileSync(`profiles/${profile.username}.json`, jsonString);
}


// Export constructors & functions
module.exports = { profile, error, write, read };
