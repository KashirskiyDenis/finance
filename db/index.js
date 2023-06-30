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

function get(collectionName, id) {
	for (let i = 0; i < db[collectionName].length; i++) {
		if (db[collectionName][i]['id'] == id) {
			return db[collectionName][i];
		}
	}
}

function add(collectionName, entyty) {
	entyty.id = db['id' + collectionName.charAt(0).toUpperCase() + collectionName.substring(1)]++;
	db[collectionName].push(entyty);
}

function update(collectionName, entyty) {
	for (let i = 0; i < db[collectionName].length; i++) {
		if (db[collectionName][i]['id'] == entyty.id) {
			db[collectionName][i] = entyty;
			break;
		}
	}
}

function remove(collectionName, id) {
	if (checkReferentialIntegrity(collectionName, id)) {
		throw new Error('Cannot to remove entyty. Referential integrity will be destroyed.');
	}
	for (let i = 0; i < db[collectionName].length; i++) {
		if (db[collectionName][i]['id'] == id) {
			db[collectionName].splice(i, 1);
			break;
		}
	}
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

module.exports = { db, initDB, writeDB , get, add, update, remove }