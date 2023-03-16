const db = require('./db');

// Add some data to the database
db.add('foo', 'bar');

// Get data from the database
console.log(db.get('foo')); // Output: "bar"

// Set data in the database
db.set('foo', 'baz');

// Remove data from the database
db.remove('foo');
