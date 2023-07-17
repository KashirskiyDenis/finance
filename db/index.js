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
			return { ...db[collectionName][i] };
		}
	}
}

function getByIdFull(collectionName, id) {
	let entity = { ...getById(collectionName, id) };
	let aFK = db.foreignKeyRead[collectionName];
	
	if (aFK.length == 0)
		return { ...entity };
	
	for (let i = 0; i < aFK.length; i++) {
		let idFK = formatId(aFK[i]);
		entity[idFK] = getByIdFull(aFK[i], entity[idFK]);
	}
	return { ...entity };
}

function getAll(collectionName) {
	return db[collectionName];
}

function getAllFull(collectionName) {
	let arr = [];
	for (let i = 0; i < db[collectionName].length; i++) {
		let idColl = formatId(collectionName);
		let entity = getByIdFull(collectionName, db[collectionName][i][idColl]);
		arr.push(entity);
	}
	return arr;
}

function add(collectionName, entity, sort) {
	let id = formatId(collectionName);
	entity[id] = db[id]++;
	for (let key in entity) {
		if (Number(entity[key]))
			entity[key] = +entity[key];
	}
	db[collectionName].push(entity);
	
	if (sort)
		db[collectionName].sort(compareFunction);
	writeDB();
	
	return { ...entity };
}

function update(collectionName, entity, sort) {
	for (let i = 0; i < db[collectionName].length; i++) {
		let id = formatId(collectionName);
		if (db[collectionName][i][id] == entity[id]) {
			db[collectionName][i] = entity;
			break;
		}
	}
	if (sort)
		db[collectionName].sort(compareFunction);
	writeDB();
	
	return { ...entity };
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

module.exports = { initDB, getById, getByIdFull, getAll, getAllFull, add, update, remove }