'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addNew = document.getElementById('addNew');
	
	let currentContent = document.getElementById('contentAccount');
	let currentDialog = document.getElementById('accountDialog');
	let currentMenu = document.getElementById('account');
	
	function activeMenu() {
		currentMenu.classList.remove('menuTab-active');
		this.classList.add('menuTab-active');
		
		if (this.id == 'statistics')
			addNew.style.display = 'none';
		else
			addNew.style.display = 'block';
		
		currentMenu = this;
		
		let content = document.getElementById('content' + this.id.charAt(0).toUpperCase() + this.id.substring(1));
		currentDialog = document.getElementById(this.id + 'Dialog');
		activeContent(content);
	}
	
	let activeContent = (content) => {
		currentContent.style.display = 'none'
		content.style.display = 'block';
		currentContent = content;
	}	
	
	addNew.addEventListener('click', () => {
		currentDialog.showModal();
	});
	
	function closeDialogWindow() {
		document.getElementById(this.dataset.dialog).close();
	};
	
	let menu = document.querySelectorAll('.menuTab');
	for (let i = 0; i < menu.length; i++) {
		menu[i].addEventListener('click', activeMenu);
	}
	
	let closeDialogButtons = document.querySelectorAll('input[data-close]');
	for (let i = 0; i < closeDialogButtons.length; i++) {
		closeDialogButtons[i].addEventListener('click', closeDialogWindow);
	}
	
	let resetDialogButtons = document.querySelectorAll('input[data-reset]');
	for (let i = 0; i < resetDialogButtons.length; i++) {
		resetDialogButtons[i].addEventListener('click',() => {
			let inputs = document.querySelectorAll('dialog > input[type=text], input[type=number]');
			let len = inputs.length;
			for (let i = 0; i < len; i++) {
				inputs[i].value = '';
			}
		});
	}
	
	let ajax = (type, url, data) => {
		let promise = new Promise(function (resolve, reject) {
			let request = new XMLHttpRequest();
			
			request.open(type, url, true);
			
			request.send(data);
			
			request.onload = function () {
				if (this.status === 200) {
					resolve(JSON.parse(this.response));
					} else {
					let error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};
			
			request.onerror = function () {
				reject(new Error("Network error"));
			};
		});
		
		return promise;
	};
	
	document.getElementById('addNewAccountDialogOk').addEventListener('click', () => {
		let titleBank = document.getElementById('titleBank').value;
		let titleAccount = document.getElementById('titleAccount').value;
		let typeAccount = document.getElementById('typeAccount').value;
		let countMoney = document.getElementById('countMoney').value;
		
		if (countMoney <= 0) {
			alert('Сумма не должна быть меньше нуля.');
			return;
		}
		
		let data = `titleBank=${titleBank}&titleAccount=${titleAccount}&typeAccount=${typeAccount}&countMoney=${countMoney}`;
		ajax('PUT', '/account/', data).then(response => {
			let card = `<div class="accountCard">
			<p class="bankAccountTitle">${response.titleBank}</p>
			<p class="bankAccountInfo">${response.titleAccount}</p>
			<p class="bankAccountInfo">${response.typeAccount}</p>
			<p class="bankAccountInfo">${response.countMoney} &#8381;</p>
			</div>`;
			
			document.querySelector('.bankAccountList').innerHTML += card;
		}).catch(e => {
			alert(e);
		});
	});
	
	document.getElementById('addNewIncomeDialogOk').addEventListener('click', () => {
		let categoryIncome = document.getElementById('categoryIncome').value;
		let countIncome = document.getElementById('countIncome').value;
		
		if (countIncome <= 0) {
			alert('Сумма не должна быть меньше нуля.');
			return;
		}
		
		let data = `categoryIncome=${categoryIncome}&countIncome=${countIncome}`;
		ajax('PUT', '/income/', data).then(response => {
			
			let income = `<tr>
			<td>${response.date}</td>
			<td>${response.categoryIncome}</td>
			<td>${response.countIncome} &#8381;</td>
			</tr>`;
			
			document.getElementById('tableIncome').innerHTML += income;
			}).catch(e => {
			alert(e);
		});
	});
	
	document.getElementById('addNewCostDialogOk').addEventListener('click', () => {
		let categoryCost = document.getElementById('categoryCost').value;
		let countCost = document.getElementById('countCost').value;
		
		if (countCost <= 0) {
			alert('Сумма не должна быть меньше нуля.');
			return;
		}
		
		let data = `categoryCost=${categoryCost}&countCost=${countCost}`;
		ajax('PUT', '/cost/', data).then(response => {
			
			let cost = `<tr>
			<td>${response.date}</td>
			<td>${response.categoryCost}</td>
			<td>${response.countCost} &#8381;</td>
			</tr>`;
			
			document.getElementById('tableCost').innerHTML += cost;
			}).catch(e => {
			alert(e);
		});
	});
	
	document.getElementById('addNewCategoryDialogOk').addEventListener('click', () => {
		let titleCategory = document.getElementById('titleCategory').value;
		
		let data = `titleCategory=${titleCategory}`;
		ajax('PUT', '/category/', data).then(response => {
			let category = `<div class="titleCategory">${response.titleCategory}</div>`;
			
			document.getElementById('.titleTableCategory').innerHTML += category;
			}).catch(e => {
			alert(e);
		});	
	});
});
