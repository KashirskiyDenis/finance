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

const formatMoney = (str) => {
	str = str.split('').reverse().join('');
	let arr = str.split(/(\d{1,3})/).reverse();
	
	for (let i = 0; i < arr.length; i++) {
		arr[i] = arr[i].split('').reverse().join('');
	}
	
	return arr.join(' ').trim();
};

const accountList = () => {
	let list = db.getAll('account');
	let html = '<div class="bankAccountList">';
	let select = '<select id="idAccount" name="idAccount">';
	
	for (let i = 0; i < list.length; i++) {
		let countMoney = list[i].countMoney.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		
		html += `<div class="accountCard">
		<p class="hidden">${list[i].idAccount}</p>
		<p class="bankAccountTitle">${list[i].titleBank}</p>
		<p class="bankAccountInfo">${list[i].titleAccount}</p>
		<p class="bankAccountInfo">${list[i].typeAccount}</p>
		<p class="bankAccountInfo countMoney">${rub} &#8381;</p><p class="countMoney">&nbsp;${kop} &#162;</p>
		</div>`;
		select += `<option value="${list[i].idAccount}">${list[i].titleAccount}</option>`;		
	}
	html += '</div>';
	select += '</select>';
	
	return { html, select };
};

const incomeList = () => {
	let list = db.getAllFull('income');
	let html = `<div id="incomeList">
	<div class="operationHead">
		<div>Дата</div>
		<div>Категория</div>
		<div>Сумма</div>
	</div>`;
	
	for (let i = 0; i < list.length; i++) {
		let countMoney = list[i].countIncome.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		
		html += `<div class="incomeRecord" data-id="${list[i].idIncome}" data-id-category="${list[i].idCategory.idCategory}" data-id-account="${list[i].idAccount.idAccount}" data-date="${list[i].date}" data-count-income="${list[i].countIncome}" data-comment="${list[i].comment}">
		<div>${list[i].date}</div>
		<div>${list[i].idCategory.title}</div>
		<div>${rub}.${kop} &#8381;</div>
		</div>`;
	}
	html += '</div>';
	
	return html;
};

const costList = () => {
	let list = db.getAllFull('cost');
	let html = `<div id="costList">
	<div class="operationHead">
		<div>Дата</div>
		<div>Категория</div>
		<div>Сумма</div>
	</div>`;
	
	for (let i = 0; i < list.length; i++) {
		let countMoney = list[i].countCost.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		
		html += `<div class="costRecord" data-id="${list[i].idCost}" data-id-category="${list[i].idCategory.idCategory}" data-id-account="${list[i].idAccount.idAccount}" data-date="${list[i].date}" data-count-cost="${list[i].countCost}" data-comment="${list[i].comment}>
		<div>${list[i].date}</div>
		<div>${list[i].idCategory.title}</div>
		<div>${rub}.${kop} &#8381;</div>
		</div>`;
	}
	html += '</div>';
	
	return html;
};

const categoryList = () => {
	let list = db.getAll('category');
	let html = '<div class="categoryList">';
	let select = '<select id="idCategory" name="idCategory">';

	for (let i = 0; i < list.length; i++) {
		html += `<div class="category">
		<div class="hidden">${list[i].idCategory}</div>
		<div class="titleCategory">${list[i].title}</div>
		<div class="comment">${list[i].comment}</div>
		</div>`;
		
		select += `<option value="${list[i].idCategory}">${list[i].title}</option>`;		
	}
	html += '</div>';
	select += '</select>';
	
	return { html, select };
};

const requestListener = function (req, res) {
	let path = url.parse(req.url).pathname;
	
	if (routes[path]) {
		fs.readFile(routes[path], { encoding: 'utf8' })
		.then(content => {
			if (routes[path].includes('index.html')) {
				content = content.toString();
				let accounts = accountList();
				content = content.replace('<div class="bankAccountList"></div>', accounts.html);
				content = content.replaceAll('<select id="idAccount" name="idAccount"></select>', accounts.select);
				
				content = content.replace('<div id="incomeList"></div>', incomeList());
				content = content.replace('<div id="costList"></div>', costList());
				
				let category = categoryList();
				content = content.replace('<div class="categoryList"></div>', category.html);
				content = content.replaceAll('<select id="idCategory" name="idCategory"></select>', category.select);
			}
			res.writeHead(200);
			res.end(content);
		});
	} else if (path.match(/(account|income|cost|category)\/[0-9]*/)) {
		let method = req.method;
		let collectionName = path.split('/')[1];
		let id = path.split('/')[2];
		
		if (method == 'GET') {
			let collection = db.getById(collectionName, id);
			
			if (!collection) {
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
					let sortFlag = (collectionName == 'cost' || collectionName == 'income') ? true : false;
					let collection = db.update(collectionName, bodyParser(bodyReq), sortFlag);
					
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify(collection));
				} catch (e) {
					res.writeHead(500);
					res.end(e.message);
				}
			});
		} else if (method == 'DELETE') {
			try {
				let result = db.remove(collectionName, id);
				
				res.setHeader('Content-Type', 'text/plain');
				res.writeHead(200);
				res.end(result.toString());
			} catch (e) {
				res.writeHead(500);
				res.end(e.message);
			}
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