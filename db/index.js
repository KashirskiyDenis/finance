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

function getById(collectionName, id) {
	for (let i = 0; i < db[collectionName].length; i++) {
		let idDB = formatId(collectionName);
		if (db[collectionName][i][idDB] == id) {
			return db[collectionName][i];
		}
	}
}

function getByIdFull(collectionName, id) {
	let entity = getById(collectionName, id);
	let foreignKeyArray = db.foreignKeyRead[collectionName];
	
	for (let i = 0; i < foreignKeyArray.length; i++) {
		let arrTmp = db[foreignKeyArray[i]];
	}
	
}

function getAll(collectionName) {
	return db[collectionName];
}

function add(collectionName, entyty, sort) {
	let id = formatId(collectionName);
	entyty[id] = db[id]++;
	db[collectionName].push(entyty);
	if (sort)
		db[collectionName].sort(compareFunction);
	writeDB();
	return entyty;
}

function update(collectionName, entyty, sort) {
	for (let i = 0; i < db[collectionName].length; i++) {
		let id = formatId(collectionName);
		if (db[collectionName][i][id] == entyty[id]) {
			db[collectionName][i] = entyty;
			break;
		}
	}
	if (sort)
		db[collectionName].sort(compareFunction);
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
	let arr = db.foreignKeyDelete[collectionName];
	let idColl = formatId(collectionName);
	
	for (let i = 0; i < arr.length; i++) {
		let refColl = arr[i];
		let tmp = db[refColl];
		
		for (let j = 0; j < tmp.length; j++) {
			if (tmp[j][idColl] == id)
				return true;
		}
		
	}
	return false;
}

function compareFunction(a, b) {
	return a.date.localeCompare(b.date);
}

module.exports = { initDB, getById, getAll, add, update, remove }