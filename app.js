'use strict';

import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { parse } from 'node:url';
import { config } from './config/index.js';
import { routes } from './routes/index.js';
import { initDB, getById, getByIdFull, getAll, getAllFull, add, update, remove, orderBy, findByField } from './db/index.js';
import { toArray } from './tsv-parser/app.js';

let monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь','Октябрь', 'Ноябрь', 'Декабрь'];

initDB(config.db);

const toArrayOperationObjects = (operationArray) => {
	let operations = [];
	for (let i = 1; i < operationArray.length; i++) {
		let arr = operationArray[i];
		for (let j = 1; j < arr.length; j++) {
			if (arr[j] == '')
				continue;
			else {
				let operation = {
					date: arr[0].split('.').reverse().join('-'),
					idCategory: operationArray[0][j],
					count: +arr[j],
					comment: '',
					idAccount: 3
				};
				operations.push(operation);
			}
		}
	}

	return operations;
}

async function loadData() {
	let collectionArray = ['income', 'cost'];
	for (let j = 0; j < collectionArray.length; j++) {
		let arrayOperationObjects;
		try {
			arrayOperationObjects = toArrayOperationObjects(await toArray(new URL(`./load-files/${collectionArray[j]}.tsv`, import.meta.url)));
		} catch (error) {
			continue;
		}
		
		for (let i = 0; i < arrayOperationObjects.length; i++) {
			let tmp = findByField('category', 'title', arrayOperationObjects[i].idCategory);
			if (tmp == null) {
				let category = add('category', {
					title : arrayOperationObjects[i].idCategory,
					type : collectionArray[j],
					comment : ''
				});
				arrayOperationObjects[i].idCategory = category.idCategory;
				add(collectionArray[j], arrayOperationObjects[i]);
			} else {
				arrayOperationObjects[i].idCategory = tmp.idCategory;
				add(collectionArray[j], arrayOperationObjects[i]);
			}
		}
		
		rm(new URL(`./load-files/${collectionArray[j]}.tsv`, import.meta.url));
	}
};

loadData();

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

const countMoneyByAccountByPeriod = (categoryName, period) => {
	let list = getAllFull(categoryName);
	if (period == 'month')
		period = new Date().toISOString().split(/\d\dT/)[0] + '01';
	else if (period == 'year')
		period = new Date().toISOString().split(/\d\d-\d\dT/)[0] + '01-01';
	
	let CMBA = new Map();
	
	for (let i = 0; i < list.length; i++) {
		if (period.localeCompare(list[i].date) > 0)
			continue;
		
		let title = list[i].idAccount.titleAccount;
		if (CMBA.get(title)) {
			let sum = round(CMBA.get(title) + list[i].count);
			CMBA.set(title, sum);
		} else
			CMBA.set(title, list[i].count);
	}
	
	return CMBA;
};

const countMoneyByCategoryByPeriod = (categoryName, period) => {
	let list = getAllFull(categoryName);
	if (period == 'month')
		period = new Date().toISOString().split(/\d\dT/)[0] + '01';
	else if (period == 'year')
		period = new Date().toISOString().split(/\d\d-\d\dT/)[0] + '01-01';

	let CMBC = new Map();
	
	for (let i = 0; i < list.length; i++) {
		if (period.localeCompare(list[i].date) > 0)
			continue;
		
		let title = list[i].idCategory.title;
		
		if (CMBC.get(title)) {
			let sum = round(CMBC.get(title) + list[i].count);
			CMBC.set(title, sum);
		} else
			CMBC.set(title, list[i].count);
	}

	return CMBC;
};

const round = (n) => {
	return +n.toFixed(2);
}

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

	for (let i = 0; i < data.length; i++) {
		let tmp = data[i].val / max * 100;
		data[i].percent = round(tmp);
		tmp = data[i].val / sum * 100;
		data[i].percentMax = round(tmp);
	}
	return data;
};

const accountList = () => {
	let list = getAll('account');
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

const operationList = (operation) => {
	let list = orderBy(getAllFull(operation), 'date', 'DESC');
	let html = `<div id="${operation}List">
	<div class="operationHead">
		<div>Дата</div>
		<div>Категория</div>
		<div>Сумма</div>
	</div>`;
	let currentMonthName = '';
	
	for (let i = 0; i < list.length; i++) {
		let monthNumber = list[i].date.match(/-(\d\d)-/)[1];
		let monthName = monthNames[+monthNumber - 1];
		
		let countMoney = list[i].count.toString();
		let rub = formatMoney(countMoney.split('.')[0]);
		let kop = countMoney.split('.')[1] ??= '00';
		let idOperation = operation == 'income' ? list[i].idIncome : list[i].idCost;
		
		if (currentMonthName != monthName) {
			html += `<h3>${monthName}</h3>`;
			currentMonthName = monthName;
		}
		
		html += `<div class="${operation}Record" data-id="${idOperation}" data-id-category="${list[i].idCategory.idCategory}" data-id-account="${list[i].idAccount.idAccount}" data-date="${list[i].date}" data-count="${list[i].count}" data-comment="${list[i].comment}" data-type="${operation}">
		<div>${list[i].date}</div>
		<div>${list[i].idCategory.title}</div>
		<div>${rub}.${kop} &#8381;</div>
		</div>`;
	}
	html += '</div>';
	
	return html;	
};

const categoryList = () => {
	let list = getAll('category');
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
	let dataChart;
	let chartsHTML = '';
	
	dataChart = createDataForChart(countMoneyByCategoryByPeriod('income', 'month'));
	chartsHTML += '<h3>За текущий месяц</h3>';
	chartsHTML += createChartHTML(dataChart, 'Доходы по категориям за текущий месяц');
	dataChart = createDataForChart(countMoneyByCategoryByPeriod('cost', 'month'));
	chartsHTML += createChartHTML(dataChart, 'Расходы по категориям за текущий месяц');
	dataChart = createDataForChart(countMoneyByAccountByPeriod('income', 'month'));
	chartsHTML += createChartHTML(dataChart, 'Доходы по счетам за текущий месяц');
	dataChart = createDataForChart(countMoneyByAccountByPeriod('cost', 'month'));
	chartsHTML += createChartHTML(dataChart, 'Расходы по счетам за текущий месяц');
	// chartsHTML += '<h3>За текущий год</h3>';
	// dataChart = createDataForChart(countMoneyByCategoryByPeriod('income', 'year'));
	// chartsHTML += createChartHTML(dataChart, 'Доходы по категориям за текущий год');
	// dataChart = createDataForChart(countMoneyByCategoryByPeriod('cost', 'year'));
	// chartsHTML += createChartHTML(dataChart, 'Расходы по категориям за текущий год');
	// dataChart = createDataForChart(countMoneyByAccountByPeriod('income', 'year'));
	// chartsHTML += createChartHTML(dataChart, 'Доходы по категориям за текущий год');
	// dataChart = createDataForChart(countMoneyByAccountByPeriod('cost', 'year'));
	// chartsHTML += createChartHTML(dataChart, 'Расходы по категориям за текущий год');
	
	return chartsHTML;
};

const requestListener = function (req, res) {
	let path = parse(req.url).pathname;
	
	if (routes[path]) {
		readFile(routes[path], { encoding: 'utf8' })
		.then(content => {
			if (routes[path].includes('index.html')) {
				content = content.toString();
				let accounts = accountList();
				content = content.replace('<div class="bankAccountList"></div>', accounts.html);
				content = content.replaceAll('<select id="idAccount" name="idAccount"></select>', accounts.select);

				content = content.replace('<div id="incomeList"></div>', operationList('income'));
				content = content.replace('<div id="costList"></div>', operationList('cost'));

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
			let entity = getById(collectionName, id);

			if (!entity) {
				res.writeHead(404);
				res.end('Not found');
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200);
				res.end(JSON.stringify(entity));
			}
		} else if (method == 'PUT') {
			let bodyReq = '';

			req.on('data', (chankData) => {
				bodyReq += chankData;
			});
			req.on('end', () => {
				try {
					let request = bodyParser(bodyReq);
					let entity = add(collectionName, request);

					if (collectionName == 'income' || collectionName == 'cost') {
						let account = getById('account', request.idAccount);

						if (collectionName == 'income')
							account.countMoney += request.count;
						else
							account.countMoney -= request.count;
						
						account.countMoney = round(account.countMoney);
						entity.idAccount = account;
						entity.idCategory = getById('category', entity.idCategory);
						update('account', account);
					}
					res.setHeader('Content-Type', 'application/json');
					res.writeHead(200);
					res.end(JSON.stringify(entity));
				} catch (error) {
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
				let request = bodyParser(bodyReq);
				let entity = null;
				try {
					entity = update(collectionName, request);

					if (collectionName == 'income' || collectionName == 'cost') {
						let account = getById('account', request.idAccount);
						let entityOld = getById(collectionName, request[formatId(collectionName)]);

						if (request.idAccount == entityOld.idAccount) {
							if (collectionName == 'income')
								account.countMoney += request.count - entityOld.count;
							else
								account.countMoney += entityOld.count - request.count;

							account.countMoney = round(account.countMoney);
							entity.idAccount = update('account', account);
							entity.idCategory = getById('category', entity.idCategory);
						} else {
							let accountOld = getById('account', entityOld.idAccount);
						
							if (collectionName == 'income') {
								accountOld.countMoney -= request.count;
								account.countMoney += request.count;
							} else {
								accountOld.countMoney += entityOld.count;
								account.countMoney -= request.count;
							}
							accountOld.countMoney = round(accountOld.countMoney);
							update('account', accountOld);
							account.countMoney = round(account.countMoney);
							entity.idAccount = update('account', account);
							entity.idCategory = getById('category', entity.idCategory);
						}
					}
				} catch (error) {
					res.writeHead(500);
					res.end(e.message);
				}				
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200);
				res.end(JSON.stringify(entity));
			});
		} else if (method == 'DELETE') {
			try {
				let entity = getById(collectionName, id);
				let result = remove(collectionName, id);

				if (collectionName == 'income' || collectionName == 'cost') {
					let account = getById('account', entity.idAccount);

					if (collectionName == 'income')
						account.countMoney -= entity.count;
					else
						account.countMoney += entity.count;

					account.countMoney = round(account.countMoney);
					update('account', account);
				}
				res.setHeader('Content-Type', 'text/plain');
				res.writeHead(200);
				res.end(result.toString());
			} catch (error) {
				res.writeHead(422);
				res.end(e.message);
			}
		}
	}  else if (path.match('charts')) {
		res.setHeader('Content-Type', 'text/html');
		res.writeHead(200);
		res.end(createAllChartHTML());
	} else {
		readFile('./404.html')
		.then(content => {
			res.writeHead(404);
			res.end(content);
		});	
	}
};

const server = createServer(requestListener);

server.listen(config.port, config.host, () => {
	console.log(`Server is running on ://${config.host}:${config.port}`);
});	