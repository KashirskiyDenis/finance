const fs = require('node:fs');
const path = require('node:path');

let rawdata = fs.readFileSync(path.join(__dirname, 'config.json'));
let config = JSON.parse(rawdata);

module.exports = config;