'use strict';

const fs = require('node:fs');

const path = __dirname + '/db.json';
let db;

function initDB(dbStructura) {
	if (fs.existsSync(path)) {
		readDB();
		return true;
	} else {
		db = dbStructura;
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

function writeDB() {
	try {
		fs.writeFileSync(path, JSON.stringify(db));
	} catch (e) {
		console.log(e.message);
	}
}

function formatId(str) {
	return 'id' + str.charAt(0).toUpperCase() + str.substring(1);
}

function get(collectionName, id) {
	for (let i = 0; i < db[collectionName].length; i++) {
		let idDB = formatId(collectionName);
		if (db[collectionName][i][idDB] == id) {
			return db[collectionName][i];
		}
	}
}

function getAll(collectionName) {
	return db[collectionName];
}

function add(collectionName, entyty) {
	let id = formatId(collectionName);
	entyty[id] = db[id]++;
	db[collectionName].push(entyty);
	writeDB();
	return entyty;
}

function update(collectionName, entyty) {
	for (let i = 0; i < db[collectionName].length; i++) {
		let id = formatId(collectionName);
		if (db[collectionName][i][id] == entyty[id]) {
			db[collectionName][i] = entyty;
			break;
		}
	}
	writeDB();
	return entyty	
}

function remove(collectionName, id) {
	if (checkReferentialIntegrity(collectionName, id)) {
		throw new Error('Cannot to remove entity. Referential integrity will be destroyed.');
	}
	for (let i = 0; i < db[collectionName].length; i++) {
		let idDB = formatId(collectionName);
		if (db[collectionName][i][idDB] == id) {
			db[collectionName].splice(i, 1);
			break;
		}
	}
	writeDB();
	
	return true;
}

function checkReferentialIntegrity(collectionName, id) {
	let arr = db.foreignKey[collectionName];
	
	for (let i = 0; i < arr.length; i++) {
		let refCall = arr[i];
		let tmp = db[refCall];
		
		for (j = 0; i< tmp.length; j++) {
			if (tmp[j]['id'] == id)
			return true
		}
		
	}
	return false;
}

module.exports = { initDB, get, getAll, add, update, remove }