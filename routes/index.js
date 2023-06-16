const fs = require('node:fs');
const path = require('node:path');

let rawdata = fs.readFileSync(path.join(__dirname, 'routes.json'));
let routes = JSON.parse(rawdata);

module.exports = routes;