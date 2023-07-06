'use strict';

const http = require('node:http');
const fs = require('node:fs').promises;
const url = require('node:url');
const config = require('./config');
const routes = require('./routes');
const db = require('./db');

db.initDB(config.db);

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

const accountList = () => {
	let list = db.getAll('account');
	let html = '<div class="bankAccountList">';
	
	for (let i = 0; i < list.length; i++) {
		html += `<div class="accountCard">
		<p class="hidden">${list[i].idAccount}</p>
		<p class="bankAccountTitle">${list[i].titleBank}</p>
		<p class="bankAccountInfo">${list[i].titleAccount}</p>
		<p class="bankAccountInfo">${list[i].typeAccount}</p>
		<p class="bankAccountInfo countMoney">${list[i].countMoney} &#8381;</p>
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
	let html = `<table id="tableCost">
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

const categoryList = () => {
	let list = db.getAll('category');
	let html = '<div class="categoryList">';
	
	for (let i = 0; i < list.length; i++) {
		html += `<div class="category">
		<div class="hidden">${list[i].idCategory}</div>
		<div class="titleCategory">${list[i].title}</div>
		<div class="comment">${list[i].comment}</div>
		</div>`;
	}
	html += '</div>';
	
	return html;
};

const requestListener = function (req, res) {
	let path = url.parse(req.url).pathname;
	
	if (routes[path]) {
		fs.readFile(routes[path], { encoding: 'utf8' })
		.then(content => {
			if (routes[path].includes('index.html')) {
				content = content.toString();
				content = content.replace('<div class="bankAccountList"></div>', accountList());
				content = content.replace('<table id="tableIncome"></table>', incomeList());
				content = content.replace('<table id="tableCost"></table>', costList());
				content = content.replace('<div class="categoryList"></div>', categoryList());
			}
			res.writeHead(200);
			res.end(content);
		});
	} else if (path.match(/(account|income|cost|category)\/[0-9]*/)) {
		let method = req.method;
		let collectionName = path.split('/')[1];
		let id = path.split('/')[2];
		
		if (method == 'GET') {
			let collection = db.get(collectionName, id);
			
			if (collection) {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(404);
				res.end('Not found');			
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200);
				res.end(JSON.stringify(collection));
			}
		} else if (method == 'PUT') {
			let bodyReq = '';
			
			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				try {
					let entity = bodyParser(bodyReq);
					
					if (collectionName == 'income' || collectionName == 'cost') {
						entity.date = new Date().toISOString();
					}
					
					let collection = db.add(collectionName, entity);

					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify(collection));
				} catch (e) {
					res.writeHead(500);
					res.end(e.message);
				}
			});
		} else if (method == 'POST') {
			let bodyReq = '';
			
			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				try {
					let collection = db.update(collectionName, bodyParser(bodyReq));
					
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify(collection));
				} catch (e) {
					res.writeHead(500);
					res.end(e.message);
				}			
			});
		} else if (method == 'DELETE') {
			let collection = db.remove(collectionName, id);
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