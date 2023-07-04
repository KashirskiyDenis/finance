'use strict';

const http = require('node:http');
const fs = require('node:fs').promises;
const url = require('node:url');
const config = require('./config');
const routes = require('./routes');
const db = require('./db');

db.initDB(config.db);
db.writeDB();

const bodyParser = (string) => {
	let collection = string.split('&');
	let object = {};
	
	for (let i = 0; i < collection.length; i++) {
		let parName = collection[i].split('=')[0];
		let parValue = collection[i].split('=')[1];
		object[parName] = parValue;
	}
	
	return object;
};

const bankAccountList = () => {
	let list = db.getAll('account');
	let html = '<div class="bankAccountList">';
	
	for (let i = 0; i < list.length; i++) {
		html += `<div class="accountCard">
		<p class="bankAccountTitle">${list[i].titleBank}</p>
		<p class="bankAccountInfo">${list[i].titleAccount}</p>
		<p class="bankAccountInfo">${list[i].typeAccount}</p>
		<p class="bankAccountInfo">${list[i].countMoney} &#8381;</p>
		</div>`;
	}
	html += '</div>';
	
	return html;
};

const incomeList = () => {
	let list = db.getAll('income');
	let html = `<table id="tableIncome">
	<thead>
	<tr>
	<th>Дата</th>
	<th>Категория</th>
	<th>Сумма</th>
	</tr>
	</thead>`;
	
	for (let i = 0; i < list.length; i++) {
		html += `<tr>
		<td>${list[i].date}</td>
		<td>${list[i].categoryIncome}</td>
		<td>${list[i].countIncome} &#8381;</td>
		</tr>`;
	}
	html += '</table>';	
	return html;
};

const costList = () => {
	let list = db.getAll('cost');
	let html = `<table id="tableIncome">
	<thead>
	<tr>
	<th>Дата</th>
	<th>Категория</th>
	<th>Сумма</th>
	</tr>
	</thead>`;
	
	for (let i = 0; i < list.length; i++) {
		html += `<tr>
		<td>${list[i].date}</td>
		<td>${list[i].categoryCost}</td>
		<td>${list[i].countICost} &#8381;</td>
		</tr>`;
	}
	html += '</table>';
	
	return html;
};

const requestListener = function (req, res) {
	let path = url.parse(req.url).pathname;
	
	if (routes[path]) {
		fs.readFile(routes[path], { encoding: 'utf8' })
		.then(content => {
			if (routes[path].includes('.html')) {
				content = content.toString();
				content = content.replace('<div class="bankAccountList"></div>', bankAccountList());
				content = content.replace('<table id="tableIncome"><\/table>', incomeList());
				content = content.replace('<table id="tableCost"><\table>', costList());
			}
			res.writeHead(200);
			res.end(content);
		});
		} else if (path.match(/(account|income|cost|category)\/[0-9]*/)) {
		let method = req.method;
		let collectionName = path.split('/')[1];
		let id = path.split('/')[2];
		
		if (method == 'GET') {
			let account = db.get(collectionName, id);
			
			if (account) {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(404);
				res.end('Not found');			
				} else {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200);
				res.end(JSON.stringify(account));
			}
			} else if (method == 'PUT') {
			let bodyReq = '';
			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				try {
					let account = db.add(collectionName, bodyParser(bodyReq));
					
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify(account));
					} catch (e) {
					res.writeHead(500);
					res.end(e.message);
				}
			});
			} else if (method == 'POST') {
			let bodyReq = '';
			
			req.on('data', (chankData) => {
				bodyReq += chankData;
			}
			);
			req.on('end', () => {
				try {
					let account = db.update(collectionName, bodyParser(bodyReq));
					
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify(account));
					} catch (e) {
					res.writeHead(500);
					res.end(e.message);
				}			
			}
			);			
			} else if (method == 'DELETE') {
			let account = db.remove(collectionName, id);
		}
		} else {
		fs.readFile('./404.html')
		.then(content => {
			res.writeHead(404);
			res.end(content);
		});	
	}
};

const server = http.createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on http://${config.host}:${config.port}`);
});	