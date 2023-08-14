'use strict';

import { readFile } from 'node:fs/promises';

async function toArray(filePath) {
	try {
		let contents = await readFile(filePath, { encoding: 'utf8' });
		let monthCost = [];
		contents = contents.split(/\r\n/);
		
		for (let i = contents.length - 1; i > 0; i--) {
			contents[i] = contents[i].replace(/\u00a0/g, '');
			contents[i] = contents[i].replace(/,/g, '.');
			let arr = contents[i].split(/\t/);
			
			if (arr[0] == '')
				continue;
			else if (arr[0].match(/\d\d\.\d\d\.\d{4}/)) {
				if (arr.length != 1)
					monthCost.push(arr);
			} else if (arr[0].match(/^[А-я]+\s\d{4}/)) {
				monthCost.push(contents[0].trim().split(/\t/));
				monthCost.reverse();
				break;
			}
		}
		return monthCost;
	} catch (error) {
		console.log(error.message);
	}
}

function toCostObject(costArray) {
	for (let i = 1; i < costArray.length; i++) {
		let arr = costArray[i];
		for (let j = 1; j < arr.length; j++) {
			if (arr[j] == '')
				continue;
			else {
				let cost = {
					date: new Date(arr[0].split('.').reverse()).toISOString().split('T')[0],
					idCategory: costArray[0][j],
					count: +arr[j],
					comment: '',
					idAccount: 3
				};
				console.log(cost);
			}
		}
	}
}

toCostObject(await toArray(new URL('./costs.tsv', import.meta.url)));