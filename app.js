'use strict';

const http = require('node:http');
const fs = require('node:fs').promises;
const config = require('./config');

const requestListener = function (req, res) {
	if (req.url =='/') {
		fs.readFile('./index.html')
			.then(contents => {
				res.setHeader('Content-Type', 'text/html');
				res.writeHead(200);
				res.end(contents);
			});
	} else if (req.url =='/public/script.js') {
		fs.readFile('./public/script.js')
			.then(contents => {
				res.setHeader('Content-Type', 'text/javascript');
				res.writeHead(200);
				res.end(contents);
			});
    } else if (req.url == '/public/style.css') {
		fs.readFile('./public/style.css')
			.then(contents => {
				res.setHeader('Content-Type', 'text/css');
				res.writeHead(200);
				res.end(contents);
			});
	} else if (req.url == '/public/images/favicon.png') {
		fs.readFile('./public/images/favicon.png')
			.then(contents => {
				res.setHeader('Content-Type', 'image/png');
				res.writeHead(200);
				res.end(contents);
			});
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.writeHead(404);
		res.end(JSON.stringify({error:'Resource not found'}));
	}
};

const server = http.createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on http://${config.host}:${config.port}`);
});		