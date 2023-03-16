const fs = require('fs');
const path = require('path');

const DB_FILE = 'data.json'; // Name of the JSON file where the data is stored
const DATA_PATH = path.join(__dirname, DB_FILE);

// Desired username object constructor
function Username(name, start_time, end_time) {
    this.name = name;
    this.start_time = start_time;
    this.end_time = end_time;
}

// Microsoft account object constructor
function MicrosoftAccount(email, password, bearer_token, bearer_token_expiration, gamepass, gamepass_expiry_date) {
    this.email = email;
    this.password = password;
    this.bearer_token = bearer_token;
    this.bearer_token_expiration = bearer_token_expiration;
    this.gamepass = gamepass;
    this.gamepass_expiry_date = gamepass_expiry_date;
}

// Check if the data file exists, and load data from it if it does
if (fs.existsSync(DATA_PATH)) {
  data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

// Function to save the data to the file
function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data));
}

// Function to get data from the database
function get(key) {
  return data[key];
}

// Function to add data to the database
function add(key, value) {
  data[key] = value;
  saveData();
}

// Function to remove data from the database
function remove(key) {
  delete data[key];
  saveData();
}

// Function to set data in the database
function set(key, value) {
  data[key] = value;
  saveData();
}

// Export the functions so they can be used in other modules
module.exports = { get, add, remove, set };
