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
	
	object = toNumber(object);
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

const formatId = (str) => {
	return 'id' + str.charAt(0).toUpperCase() + str.substring(1);
};

const toNumber = (obj) => {
	for (let key in obj) {
		if (Number(obj[key]) || obj[key] == '0')
			obj[key] = +obj[key];
	}
	return obj;
};

const countMoneyByAccountCurrentMonth = (categoryName) => {
	let list = db.getAllFull(categoryName);
	let currentMonthFirstDay = new Date().toISOString().split(/\d\dT/)[0] + '01';
	let CMBA = new Map();
	
	for (let i = 0; i < list.length; i++) {
		if (currentMonthFirstDay.localeCompare(list[i].date) > 0)
			continue;
		
		let title = list[i].idAccount.titleAccount;
		if (CMBA.get(title)) {
			let sum = CMBA.get(title) + list[i].count;
			CMBA.set(title, sum);
		} else
			CMBA.set(title, list[i].count);
	}
	
	return CMBA;
};

const countMoneyByCategoryCurrentMonth = (categoryName) => {
	let list = db.getAllFull(categoryName);
	let currentMonthFirstDay = new Date().toISOString().split(/\d\dT/)[0] + '01';
	let CMBC = new Map();
	
	for (let i = 0; i < list.length; i++) {
		if (currentMonthFirstDay.localeCompare(list[i].date) > 0)
			continue;
		
		let title = list[i].idCategory.title;
		if (CMBC.get(title)) {
			let sum = CMBC.get(title) + list[i].count;
			CMBC.set(title, sum);
		} else
			CMBC.set(title, list[i].count);
	}
	
	return CMBC;
};

const createDataForChart = (assArr) => {
	let max = -1;
	let sum = 0;
	let data = [];
	
	for (let entry of assArr) {
		let key = Object.values(entry)[0];
		let val = Object.values(entry)[1];
		
		if (val > max)
			max = val;
		
		sum += val;
		data.push({ title : key , val : val });
	}

	for (let i =0; i < data.length; i++) {
		let tmp = data[i].val / max * 100;
		data[i].percent = Math.floor(tmp * 100) / 100;
		tmp = data[i].val / sum * 100;
		data[i].percentMax = Math.floor(tmp * 100) / 100;
	}
	
	return data;
};

const accountList = () => {
	let list = db.getAll('account');
	let html = '<div class="bankAccountList">';
	let select = '<select id="idAccount" name="idAccount">';
	
	for (let i = 0; i < list.length; i++) {
		let countMoney = list[i].countMoney.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		
		html += `<div class="accountCard" data-id="${list[i].idAccount}" data-title-bank="${list[i].titleBank}" data-title-account="${list[i].titleAccount}" data-type-account="${list[i].typeAccount}" data-count-money="${list[i].countMoney}">
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
		let countMoney = list[i].count.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		
		html += `<div class="incomeRecord" data-id="${list[i].idIncome}" data-id-category="${list[i].idCategory.idCategory}" data-id-account="${list[i].idAccount.idAccount}" data-date="${list[i].date}" data-count="${list[i].count}" data-comment="${list[i].comment}">
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
		let countMoney = list[i].count.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		
		html += `<div class="costRecord" data-id="${list[i].idCost}" data-id-category="${list[i].idCategory.idCategory}" data-id-account="${list[i].idAccount.idAccount}" data-date="${list[i].date}" data-count="${list[i].count}" data-comment="${list[i].comment}">
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
		html += `<div class="category" data-id="${list[i].idCategory}" data-title="${list[i].title}" data-comment="${list[i].comment}">
		<div class="titleCategory">${list[i].title}</div>
		<div class="comment">${list[i].comment}</div>
		</div>`;
		
		select += `<option value="${list[i].idCategory}">${list[i].title}</option>`;
	}
	html += '</div>';
	select += '</select>';
	
	return { html, select };
};

const createChartHTML = (data, titleChart) => {
	let html = `<div class="chart">
	<h3>${titleChart}</h3>
	<div class="chartBody">`;
	
	for (let i = 0; i < data.length; i++) {
		let rub = formatMoney(data[i].val.toString().split('.')[0]);
		let kop = data[i].val.toString().split('.')[1] ??= '00';
		
		html += `<div>${data[i].title}</div>
		<div style="background-image: linear-gradient(to right, #1978d2 ${data[i].percent}%, #ffffff ${data[i].percent}% 100%);" data-tooltip="Процент от общей суммы ${data[i].percentMax}"></div>
		<div>${rub}.${kop} &#8381;</div>`;
	}
	
	html += '</div></div>'
	
	return html;
};

const createAllChartHTML = () => {
	let dataChart = createDataForChart(countMoneyByCategoryCurrentMonth('income'));
	let chartsHTML = createChartHTML(dataChart, 'Доходы по категориям за текущий месяц');
	dataChart = createDataForChart(countMoneyByCategoryCurrentMonth('cost'));
	chartsHTML += createChartHTML(dataChart, 'Расходы по категориям за текущий месяц');
	dataChart = createDataForChart(countMoneyByAccountCurrentMonth('income'));
	chartsHTML += createChartHTML(dataChart, 'Доходы по категориям за текущий месяц');
	dataChart = createDataForChart(countMoneyByAccountCurrentMonth('cost'));
	chartsHTML += createChartHTML(dataChart, 'Расходы по категориям за текущий месяц');	
	return chartsHTML;
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
				
				let chartsHTML = createAllChartHTML();
				content = content.replace('<div class="chart"></div>', chartsHTML);
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

					if (collectionName == 'income' || collectionName == 'cost') {
						let account = db.getById('account', entity.idAccount);

						if (collectionName == 'income')
							account.countMoney += entity.count;
						else
							account.countMoney -= entity.count;

						collection.idAccount = account;
						collection.idCategory = db.getById('category', collection.idCategory);
						db.update('account', account);
					}
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
				let entity = bodyParser(bodyReq);
				let sortFlag = false;
				let collection = null;

				try {
					if (collectionName == 'income' || collectionName == 'cost') {
						let account = db.getById('account', entity.idAccount);
						let entityOld = db.getById(collectionName, entity[formatId(collectionName)]);

						sortFlag = true;
						collection = db.update(collectionName, entity, sortFlag);

						if (entity.idAccount == entityOld.idAccount) {
							if (collectionName == 'income')
								account.countMoney += entity.count - entityOld.count;
							else
								account.countMoney += entityOld.count - entity.count;

							collection.idAccount = db.update('account', account);
							collection.idCategory = db.getById('category', collection.idCategory);
						} else {
							let accountOld = db.getById('account', entityOld.idAccount);
						
							if (collectionName == 'income') {
								accountOld.countMoney -= entity.count;
								account.countMoney += entity.count;
							} else {
								accountOld.countMoney += entityOld.count;
								account.countMoney -= entity.count;
							}
							db.update('account', accountOld);
							collection.idAccount = db.update('account', account);
							collection.idCategory = db.getById('category', collection.idCategory);
						}
					} else {
						collection = db.update(collectionName, entity);
					}
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
				let entity = db.getById(collectionName, id);
				let result = db.remove(collectionName, id);

				if (collectionName == 'income' || collectionName == 'cost') {
					let account = db.getById('account', entity.idAccount);

					if (collectionName == 'income')
						account.countMoney -= entity.count;
					else
						account.countMoney += entity.count;

					db.update('account', account);
				}
				res.setHeader('Content-Type', 'text/plain');
				res.writeHead(200);
				res.end(result.toString());
			} catch (e) {
				res.writeHead(422);
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