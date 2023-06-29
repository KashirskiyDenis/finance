'use strict';

const http = require('node:http');
const fs = require('node:fs').promises;
const url = require('node:url');
const config = require('./config');
const routes = require('./routes');
// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database(':memory:');
const db = require('./db');

console.log(db.createDB());

const requestListener = function (req, res) {
	let path = url.parse(req.url).pathname;
	
	if (routes[path]) {
		fs.readFile(routes[path])
		.then(contents => {
			res.writeHead(200);
			res.end(contents);
		});			
	} else if (path == '/account') {
		let method = req.method;
		
		if (method == 'GET') {
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(200);
			res.end('{"message": "This is a JSON response"}');				
		} else if (method == 'PUT') {
		} else if (method == 'POST') {
		} else if (method == 'DELETE') {
		}
	} else {
		fs.readFile('./404.html')
		.then(contents => {
			res.writeHead(404);
			res.end(contents);
		});		
	}
};

const server = http.createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on http://${config.host}:${config.port}`);
});