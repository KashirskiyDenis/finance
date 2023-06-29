'use strict';

const fs = require('node:fs');

const path = __dirname + '/db.json';
let db;

function createDB() {
	if (!fs.existsSync(path)) {
		db = {
			idAccount : 0,
			idIncome : 0,
			idCosts : 0,
			idCategory : 0
		};
		writeDB(db);
		return true;
	} else {
		return false;
	}
}

function readDB() {
	try {
		db = JSON.parse(fs.readFileSync(path));
	} catch (e) {
		console.log(e.message);
	}
}

function writeDB(data) {
	try {
		fs.writeFileSync(path, JSON.stringify(data));
	} catch (e) {
		console.log(e.message);
	}
}

function addAccount(account) {
	account.id = ++db.idAccount;
	db.accounts.push(account);
}

function changeAccount(account) {
	for (let i = 0; i < db.accounts.length; i++) {
		if (db.accounts[i].id == account.id) {
			db.accounts[i] = account;
			break;
		}
	}
}

function deleteAccount(account) {
	for (let i = 0; i < db.accounts.length; i++) {
		if (db.accounts[i].id == account.id) {
			db.accounts.splice(i, 1);
			break;
		}
	}
}

function addIncome(income) {
	income.id = ++db.idIncome;
	db.income.push(income);
}

function changeIncome(income) {
	for (let i = 0; i < db.income.length; i++) {
		if (db.income[i].id == income.id) {
			db.income[i] = income;
			break;
		}
	}
}

function deleteIncome(income) {
	for (let i = 0; i < db.income.length; i++) {
		if (db.income[i].id == income.id) {
			db.income.splice(i, 1);
			break;
		}
	}
}

function addCosts(costs) {
	costs.id = ++db.idCosts;
	db.costs.push(costs);
}

function changeCosts(costs) {
	for (let i = 0; i < db.costs.length; i++) {
		if (db.costs[i].id == costs.id) {
			db.costs[i] = costs;
			break;
		}
	}
}

function deleteCosts(costs) {
	for (let i = 0; i < db.costs.length; i++) {
		if (db.costs[i].id == costs.id) {
			db.costs.splice(i, 1);
			break;
		}
	}
}

module.exports = { createDB, readDB, writeDB }

// ({ accounts : [ { 
// id : 1,
// titleBank : 'Сбер',
// titleAccount : 'Копилка',
// typeAccount : 'Накопительный счёт',
// countMoney : 1536.96
// },
// {
// id : 2,
// titleBank : 'Газпром Банк',
// titleAccount : 'Зарплатный',
// typeAccount : 'Дебетовый счёт',
// countMoney : 59232.96
// } ],
// income : [ {
// id: 1,
// date: '2023-06-05 08:30',
// category: 'Работа',
// count : 56456.52,
// idAccount : 1
// },
// {
// id: 2,
// date: '2023-06-25 08:30',
// category: 'Подработка',
// count : 26456.52,
// idAccount : 2			
// } ],
// costs : [ {
// id : 1,
// date : "2023-05-05 08:30",
// category : "То",
// count : 1456.52,
// idAccount : 1
// },
// {
// id : 2,
// date : "2023-06-06 08:30",
// category : "Сё",
// count : 56.52,
// idAccount : 2			
// } ],
// category : [ {}, {} ]});

// console.log(readDB());