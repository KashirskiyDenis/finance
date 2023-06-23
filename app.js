'use strict';

const http = require('node:http');
const fs = require('node:fs').promises;
const url = require('node:url');
const config = require('./config');
const routes = require('./routes');

const requestListener = function (req, res) {
	let path = routes[url.parse(req.url).pathname] ?? './404.html';

	fs.readFile(path)
	.then(contents => {
		res.writeHead(200);
		res.end(contents);
	});	
};

const server = http.createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on http://${config.host}:${config.port}`);
});