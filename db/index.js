'use strict';

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = new URL('./db.json', import.meta.url);
let db;

function initDB(dbStructura) {
	if (existsSync(path)) {
		readDB();
		return true;
	} else {
		db = dbStructura;
		return false;
	}
}

function readDB() {
	try {
		db = JSON.parse(readFileSync(path));
	} catch (error) {
		console.log(error.message);
	}
}

function writeDB() {
	try {
		writeFileSync(path, JSON.stringify(db));
	} catch (error) {
		console.log(error.message);
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
	return [...db[collectionName]];
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

function add(collectionName, entity) {
	let id = formatId(collectionName);
	entity[id] = db[id]++;
	for (let key in entity) {
		if (Number(entity[key]))
			entity[key] = +entity[key];
	}
	db[collectionName].push(entity);
	writeDB();
	
	return { ...entity };
}

function update(collectionName, entity) {
	for (let i = 0; i < db[collectionName].length; i++) {
		let id = formatId(collectionName);
		if (db[collectionName][i][id] == entity[id]) {
			db[collectionName][i] = entity;
			break;
		}
	}
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

function orderBy(collection, field, orderType) {
	let compareString = (a, b) => a[field].localeCompare(b[field]);
	let compareNumber = (a, b) => a[field] - b[field];
	
	if (collection.length <= 1)
		return collection;
	
	let type = typeof(collection[0][field]);
	
	if (type == 'string')
		collection.sort(compareString);
	else if (type == 'number')
		collection.sort(compareNumber);
	
	if (orderType == 'DESC')
		collection.reverse();
	
	return collection;
}

function findByField(collectionName, fieldName, fieldValue) {
	for (let i = 0; i < db[collectionName].length; i++) {
		if (db[collectionName][i][fieldName] == fieldValue)
			return {...db[collectionName][i]};
	}
	return null;
}

export { initDB, getById, getByIdFull, getAll, getAllFull, add, update, remove, orderBy, findByField };