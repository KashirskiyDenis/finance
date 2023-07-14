'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addNew = document.getElementById('addNew');
	let currentContent = document.getElementById('accountContent');
	let currentDialog = document.getElementById('accountDialog');
	let currentMenu = document.getElementById('account');
	let currentEntity = null;
	
	function activeMenu() {
		currentMenu.classList.remove('menuTab-active');
		this.classList.add('menuTab-active');
		
		if (this.id == 'statistics')
			addNew.style.display = 'none';
		else
			addNew.style.display = 'block';
		
		currentMenu = this;
		
		let content = document.getElementById(this.id + 'Content');
		currentDialog = document.getElementById(this.id + 'Dialog');
		activeContent(content);
	}
	
	let activeContent = (content) => {
		currentContent.style.display = 'none'
		content.style.display = 'block';
		currentContent = content;
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
				reject(new Error('Network error'));
			};
		});
		
		return promise;
	};
	
	const formatMoney = (str) => {
		str = str.split('').reverse().join('');
		let arr = str.split(/(\d{1,3})/).reverse();
		
		for (let i = 0; i < arr.length; i++) {
			arr[i] = arr[i].split('').reverse().join('');
		}
		
		return arr.join(' ').trim();
	};	
	
	let formatId = (str) => {
		return 'id' + str.charAt(0).toUpperCase() + str.substring(1);
	}
	
	addNew.addEventListener('click', () => {
		currentDialog.showModal();
		hiddenEntityAdd(currentMenu.id);
		resetForm();
	});
	
	function closeDialogWindow() {
		currentDialog.close();
	}
	
	let menu = document.querySelectorAll('.menuTab');
	for (let i = 0; i < menu.length; i++) {
		menu[i].addEventListener('click', activeMenu);
	}
	
	let closeDialogButtons = document.querySelectorAll('input[data-cancel]');
	for (let i = 0; i < closeDialogButtons.length; i++) {
		closeDialogButtons[i].addEventListener('click', () => {
			currentDialog.close();
		});
	}
	
	let resetForm = () => {
		let inputs = currentDialog.querySelectorAll('input[type=text], input[type=number]');
		let len = inputs.length;
		for (let i = 0; i < len; i++) {
			inputs[i].value = '';
		}		
	};
	
	let resetDialogButtons = document.querySelectorAll('input[data-reset]');
	for (let i = 0; i < resetDialogButtons.length; i++) {
		resetDialogButtons[i].addEventListener('click', resetForm);
	}
	
	let deleteEntity = (event) => {
		let collectionName = event.target.dataset['entity'];
		let id = currentEntity.querySelector('.hidden').innerText;
		ajax('DELETE', `/${collectionName}/` + id).then(response => {
			currentDialog.close();
			currentEntity.remove();
		}).catch(e => {
			alert(e);
		});		
	};
	
	let deleteDialogButtons = document.querySelectorAll('input[data-delete]');
	for (let i = 0; i < deleteDialogButtons.length; i++) {
		deleteDialogButtons[i].addEventListener('click', deleteEntity);
	}

	let hiddenEntityAdd = (entityName) => {
		currentDialog.querySelector(`#${entityName}UpdateOk`).classList.add('hidden');
		currentDialog.querySelector(`#${entityName}Delete`).classList.add('hidden');
		currentDialog.querySelector(`#${entityName}AddOk`).classList.remove('hidden');
		currentDialog.querySelector(`#${entityName}Reset`).classList.remove('hidden');
	};
	
	let hiddenEntityUpdate = (entityName) => {
		currentDialog.querySelector(`#${entityName}UpdateOk`).classList.remove('hidden');
		currentDialog.querySelector(`#${entityName}Delete`).classList.remove('hidden');
		currentDialog.querySelector(`#${entityName}AddOk`).classList.add('hidden');
		currentDialog.querySelector(`#${entityName}Reset`).classList.add('hidden');
	};	
	
	let getAccountById = (event) => {
		currentEntity = event.currentTarget;
		let id = currentEntity.querySelector('.hidden').innerText;
		
		ajax('GET', '/account/' + id).then(response => {
			currentDialog.showModal();
			currentDialog.querySelector('#idAccount').value = response.idAccount;
			currentDialog.querySelector('#titleBank').value = response.titleBank;
			currentDialog.querySelector('#titleAccount').value = response.titleAccount;
			currentDialog.querySelector('#typeAccount').value = response.typeAccount;
			currentDialog.querySelector('#countMoney').value = response.countMoney;
			
			hiddenEntityUpdate('account');
		}).catch(e => {
			alert(e);
		});
	};	
	
	let accountList = document.querySelectorAll('.accountCard');
	for (let i = 0; i < accountList.length; i++) {
		accountList[i].addEventListener('click', getAccountById);
	}
	
	let getIncomeById = (event) => {
		currentEntity = event.currentTarget;
		currentDialog.showModal();
		currentDialog.querySelector('#idIncome').value = currentEntity.dataset.id;
		currentDialog.querySelector('#idCategory').value = currentEntity.dataset.idCategory;
		currentDialog.querySelector('#dateIncome').value = currentEntity.dataset.date;
		currentDialog.querySelector('#countIncome').value = currentEntity.dataset.countIncome;
		currentDialog.querySelector('#commentIncome').value = currentEntity.dataset.comment;
		currentDialog.querySelector('#idAccount').value = currentEntity.dataset.idAccount;
		hiddenEntityUpdate('income');
	};
	
	let incomeList = document.querySelectorAll('.incomeRecord');
	for (let i = 0; i < incomeList.length; i++) {
		incomeList[i].addEventListener('click', getIncomeById);
	}	
	
	let getCostById = (event) => {
		currentEntity = event.currentTarget;
		currentDialog.showModal();
		currentDialog.querySelector('#idCost').value = currentEntity.dataset.id;
		currentDialog.querySelector('#idCategory').value = currentEntity.dataset.idCategory;
		currentDialog.querySelector('#dateCost').value = currentEntity.dataset.date;
		currentDialog.querySelector('#countCost').value = currentEntity.dataset.countCost;
		currentDialog.querySelector('#commentCost').value = currentEntity.dataset.comment;
		currentDialog.querySelector('#idAccount').value = currentEntity.dataset.idAccount;
		hiddenEntityUpdate('cost');
	};
	
	let costList = document.querySelectorAll('.costRecord');
	for (let i = 0; i < costList.length; i++) {
		costList[i].addEventListener('click', getCostById);
	}
	
	let getCategoryById = (event) => {
		currentEntity = event.currentTarget;
		let id = currentEntity.querySelector('.hidden').innerText;
		
		ajax('GET', '/category/' + id).then(response => {
			currentDialog.showModal();
			currentDialog.querySelector('#idCategory').value = response.idCategory;
			currentDialog.querySelector('#titleCategory').value = response.title;
			currentDialog.querySelector('#commentCategory').value = response.comment;
			
			hiddenEntityUpdate('category');
		}).catch(e => {
			alert(e);
		});		
	};
	
	let categoryList = document.querySelectorAll('.category');
	for (let i = 0; i < categoryList.length; i++) {
		categoryList[i].addEventListener('click', getCategoryById);
	}	

	let addOrUpdateAccount = (event) => {
		let account = Object.fromEntries(new FormData(document.getElementById('accountForm')).entries());
		if (account.countMoney <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		
		let data = `idAccount=${account.idAccount}&titleBank=${account.titleBank}&titleAccount=${account.titleAccount}&typeAccount=${account.typeAccount}&countMoney=${account.countMoney}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/account/', data).then(response => {
			let countMoney = response.countMoney;
			let rub = formatMoney(countMoney.split('.')[0]);
			let kop = countMoney.split('.')[1] ??= '00';
			let html = `<div class="accountCard">
			<p class="hidden">${response.idAccount}</p>
			<p class="bankAccountTitle">${response.titleBank}</p>
			<p class="bankAccountInfo">${response.titleAccount}</p>
			<p class="bankAccountInfo">${response.typeAccount}</p>
			<p class="bankAccountInfo countMoney">${rub} &#8381;</p><p class="countMoney">&nbsp;${kop} &#162;</p>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newAccount = dom.querySelector('.accountCard');
			newAccount.addEventListener('click', getAccountById);
			
			if (method == 'PUT') {
				document.querySelector('.bankAccountList').appendChild(newAccount);
				addOrUpdateAccountSelect('PUT', newAccount);
			} else {
				currentEntity.innerHTML = newAccount.innerHTML;
				addOrUpdateAccountSelect('POST', newAccount);
			}
		}).catch(e => {
			alert(e);
		});
	};
	
	let addOrUpdateAccountSelect = (operation, entity) => {
		let incomeDialog = document.getElementById('incomeDialog');
		if (operation == 'PUT') {
			incomeDialog.querySelector('#idAccount').innerHTML += `<option value="${entity.idAccount}">${entity.titleAccount}</option>`;
		} else if (operation == 'POST') {
			incomeDialog.querySelector('#idAccount').options[entity.idAccount].innerText = entity.titleAccount;
		}
	};
	
	document.getElementById('accountAddOk').addEventListener('click', addOrUpdateAccount);
	document.getElementById('accountUpdateOk').addEventListener('click', addOrUpdateAccount);
	
	let addOrUpdateIncome = (event) => {
		let income = Object.fromEntries(new FormData(document.getElementById('incomeForm')).entries());
		if (income.countIncome <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		income.dateIncome = income.dateIncome.toString().split('T')[0];
		let data = `idIncome=${income.idIncome}&date=${income.dateIncome}&idCategory=${income.idCategory}&countIncome=${income.countIncome}&comment=${income.commentIncome}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/income/', data).then(response => {
			let html = `<div class="incomeRecord">
			<div class="hidden">${response.idIncome}</div>
			<div>${response.date}</div>
			<div>${response.idCategory}</div>
			<div>${response.countIncome} &#8381;</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newIncome = dom.querySelector('.incomeRecord');
			newIncome.addEventListener('click', getIncomeById);
			
			if (method == 'PUT')
				document.getElementById('incomeList').appendChild(newIncome);
			else
				currentEntity.innerHTML = newIncome.innerHTML;			
		}).catch(e => {
			alert(e);
		});		
	};
	
	document.getElementById('incomeAddOk').addEventListener('click', addOrUpdateIncome);
	document.getElementById('incomeUpdateOk').addEventListener('click', addOrUpdateIncome);
	
	let addOrUpdateCost = () => {
		let cost = Object.fromEntries(new FormData(document.getElementById('costForm')).entries());
		if (cost.countCost <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		cost.dateCost = cost.dateCost.toString().split('T')[0];
		let data = `idCost=${cost.idCost}&date=${cost.dateCost}&idCategory=${cost.idCategory}&countCost=${cost.countCost}&comment=${cost.commentCost}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/cost/', data).then(response => {
			let html = `<div class="costRecord">
			<div class="hidden">${response.idCost}</div>
			<div>${response.date}</div>
			<div>${response.idCategory}</div>
			<div>${response.countCost} &#8381;</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newCost = dom.querySelector('.costRecord');
			newCost.addEventListener('click', getCostById);
			
			if (method == 'PUT')
				document.getElementById('costList').appendChild(newCost);
			else
				currentEntity.innerHTML = newCost.innerHTML;
		}).catch(e => {
			alert(e);
		});			
	};
	
	document.getElementById('costAddOk').addEventListener('click', addOrUpdateCost);
	document.getElementById('costUpdateOk').addEventListener('click', addOrUpdateCost);
	
	let addOrUpdateCategory = () => {
		let category = Object.fromEntries(new FormData(document.getElementById('categoryForm')).entries());
		let data = `idCategory=${category.idCategory}&title=${category.titleCategory}&comment=${category.commentCategory}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/category/', data).then(response => {
			let html = `<div class="category">
			<div class="hidden">${response.idCategory}</div>
			<div class="titleCategory">${response.title}</div>
			<div class="comment">${response.comment}</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newCategory = dom.querySelector('.category');
			newCategory.addEventListener('click', getCategoryById);
			
			if (method == 'PUT')
				document.querySelector('.categoryList').appendChild(newCategory);
			else
				currentEntity.innerHTML = newCategory.innerHTML;
		}).catch(e => {
			alert(e);
		});
	};
	
	document.getElementById('categoryAddOk').addEventListener('click', addOrUpdateCategory);
	document.getElementById('categoryUpdateOk').addEventListener('click', addOrUpdateCategory);
});
