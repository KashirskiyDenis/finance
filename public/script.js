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
					resolve(this.response);
				} else if (this.status === 422) {
					reject(this.responseText);
				} else {
					let error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};
			
			request.onerror = function (error) {
				reject(new Error('Network error'));
			};
		});
		
		return promise;
	};
	
	let formatMoney = (str) => {
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
		let id = currentEntity.dataset.id;
		ajax('DELETE', `/${collectionName}/` + id, null).then(response => {
			currentDialog.close();
			currentEntity.remove();
			if (collectionName == 'account' || collectionName == 'category')
				deleteEntityOption(id, collectionName);
			else if (collectionName == 'cost')
				updateAccountCountMoney(currentEntity.dataset.idAccount, currentEntity.dataset.count);
			else if (collectionName == 'income')
				updateAccountCountMoney(currentEntity.dataset.idAccount, -1 * currentEntity.dataset.count);
			updateCharts();
		}).catch(error => {
			alert(error);
		});		
	};
	
	let deleteEntityOption = (entityId, collectionName) => {
		let id = formatId(collectionName);
		let select = document.querySelectorAll('select#' + id);	
		for (let i = 0; i < select.length; i++) {
			for (let j = 0; j < select[i].options.length; j++) {
				if (select[i][j].value == entityId)
					select[i][j].remove();
			}
		}	
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
		currentDialog.showModal();
		currentDialog.querySelector('#idAccount').value = currentEntity.dataset.id;
		currentDialog.querySelector('#titleBank').value = currentEntity.dataset.titleBank;
		currentDialog.querySelector('#titleAccount').value = currentEntity.dataset.titleAccount;
		currentDialog.querySelector('#typeAccount').value = currentEntity.dataset.typeAccount;
		currentDialog.querySelector('#countMoney').value = currentEntity.dataset.countMoney;
		hiddenEntityUpdate('account');
	};	
	
	let accountList = document.querySelectorAll('.accountCard');
	for (let i = 0; i < accountList.length; i++) {
		accountList[i].addEventListener('click', getAccountById);
	}
	
	let getOperationById = (event) => {
		currentEntity = event.currentTarget;
		currentDialog.showModal();
		let id = formatId(currentEntity.dataset.type);
		currentDialog.querySelector('#' + id).value = currentEntity.dataset.id;
		currentDialog.querySelector('#idCategory').value = currentEntity.dataset.idCategory;
		currentDialog.querySelector('#date').value = currentEntity.dataset.date;
		currentDialog.querySelector('#count').value = currentEntity.dataset.count;
		currentDialog.querySelector('#comment').value = currentEntity.dataset.comment;
		currentDialog.querySelector('#idAccount').value = currentEntity.dataset.idAccount;
		hiddenEntityUpdate(currentEntity.dataset.type);
	};
	
	let incomeList = document.querySelectorAll('.incomeRecord');
	for (let i = 0; i < incomeList.length; i++) {
		incomeList[i].addEventListener('click', getOperationById);
	}	
	
	let costList = document.querySelectorAll('.costRecord');
	for (let i = 0; i < costList.length; i++) {
		costList[i].addEventListener('click', getOperationById);
	}
	
	let getCategoryById = (event) => {
		currentEntity = event.currentTarget;
		currentDialog.showModal();
		currentDialog.querySelector('#idCategory').value = currentEntity.dataset.idCategory;
		currentDialog.querySelector('#titleCategory').value = currentEntity.dataset.title;
		currentDialog.querySelector('#commentCategory').value = currentEntity.dataset.comment;
		hiddenEntityUpdate('category');
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
			response = JSON.parse(response);
			let countMoney = response.countMoney.toString();
			let rub = formatMoney(countMoney.split('.')[0]);
			let kop = countMoney.split('.')[1] ??= '00';
			let html = `<div class="accountCard" data-id="${response.idAccount}" data-title-bank="${response.titleBank}" data-title-account="${response.titleAccount}" data-type-account="${response.typeAccount}" data-count-money="${response.countMoney}">
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
				addOrUpdateAccountSelect('PUT', response);
			} else {
				currentEntity.innerHTML = newAccount.innerHTML;
				addOrUpdateAccountSelect('POST', response);
			}
		}).catch(error => {
			alert(error);
		});
	};
	
	let addOrUpdateAccountSelect = (method, account) => {
		let select = document.querySelectorAll('select#idAccount');
		if (method == 'PUT') {
			for (let i = 0; i < select.length; i++) {
				select[i].innerHTML += `<option value="${account.idAccount}">${account.titleAccount}</option>`;
			}
		} else if (method == 'POST') {
			for (let i = 0; i < select.length; i++) {
				for (let j = 0; j < select[i].options.length; j++) {
					if (select[i][j].value == account.idAccount)
						select[i][j].innerHTML = account.titleAccount;
				}
			}
		}
	};
	
	document.getElementById('accountAddOk').addEventListener('click', addOrUpdateAccount);
	document.getElementById('accountUpdateOk').addEventListener('click', addOrUpdateAccount);
	
	let addOrUpdateIncome = (event) => {
		let income = Object.fromEntries(new FormData(document.getElementById('incomeForm')).entries());
		if (income.count <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		income.date = income.date.toString().split('T')[0];
		let data = `idIncome=${income.idIncome}&date=${income.date}&idCategory=${income.idCategory}&count=${income.count}&comment=${income.comment}&idAccount=${income.idAccount}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/income/', data).then(response => {
			response = JSON.parse(response);
			let html = `<div class="incomeRecord" data-id="${response.idIncome}" data-id-category="$response.idCategory.idCategory}" data-id-account="${response.idAccount.idAccount}" data-date="$response.date}" data-count="${response.count}" data-comment="${response.comment}" data-type="income">
			<div class="hidden">${response.idIncome}</div>
			<div>${response.date}</div>
			<div>${response.idCategory.title}</div>
			<div>${response.count} &#8381;</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newIncome = dom.querySelector('.incomeRecord');
			newIncome.addEventListener('click', getOperationById);
			
			if (method == 'PUT') {
				document.getElementById('incomeList').appendChild(newIncome);
				updateAccountCountMoney(response.idAccount.idAccount, response.count);
			} else {
				if (currentEntity.dataset.idAccount == response.idAccount.idAccount) {
					let count = +newCost.dataset.count - +currentEntity.dataset.count;
					count = +count.toFixed(2);
					updateAccountCountMoney(response.idAccount.idAccount, count);
					currentEntity.innerHTML = newCost.innerHTML;
				} else {
					updateAccountCountMoney(currentEntity.dataset.idAccount, -1 * currentEntity.dataset.count);
					updateAccountCountMoney(response.idAccount.idAccount, response.count);
				}			
				currentEntity.innerHTML = newIncome.innerHTML;			
			}
		}).catch(error => {
			alert(error);
		});		
	};
	
	document.getElementById('incomeAddOk').addEventListener('click', addOrUpdateIncome);
	document.getElementById('incomeUpdateOk').addEventListener('click', addOrUpdateIncome);
	
	let addOrUpdateCost = () => {
		let cost = Object.fromEntries(new FormData(document.getElementById('costForm')).entries());
		if (cost.count <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		cost.date = cost.date.toString().split('T')[0];
		let data = `idCost=${cost.idCost}&date=${cost.date}&idCategory=${cost.idCategory}&count=${cost.count}&comment=${cost.comment}&idAccount=${cost.idAccount}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/cost/', data).then(response => {
			response = JSON.parse(response);
			let html = `<div class="costRecord" data-id="${response.idCost}" data-id-category="${response.idCategory.idCategory}" data-id-account="${response.idAccount.idAccount}" data-date="${response.date}" data-count="${response.count}" data-comment="${response.comment}" data-type="cost">
			<div>${response.date}</div>
			<div>${response.idCategory.title}</div>
			<div>${response.count} &#8381;</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newCost = dom.querySelector('.costRecord');
			newCost.addEventListener('click', getOperationById);
			
			if (method == 'PUT') {
				document.getElementById('costList').appendChild(newCost);
				updateAccountCountMoney(response.idAccount.idAccount, -1 * response.count);
			} else {
				if (currentEntity.dataset.idAccount == response.idAccount.idAccount) {
					let count = +newCost.dataset.count - +currentEntity.dataset.count;
					count = +count.toFixed(2);
					updateAccountCountMoney(response.idAccount.idAccount, -1 * count);
					currentEntity.innerHTML = newCost.innerHTML;
				} else {
					updateAccountCountMoney(currentEntity.dataset.idAccount, currentEntity.dataset.count);
					updateAccountCountMoney(response.idAccount.idAccount, -1 * response.count);
				}
				currentEntity.innerHTML = newCost.innerHTML;
			}
			
			updateCharts();
		}).catch(error => {
			alert(error);
		});			
	};
	
	document.getElementById('costAddOk').addEventListener('click', addOrUpdateCost);
	document.getElementById('costUpdateOk').addEventListener('click', addOrUpdateCost);
	
	let updateAccountCountMoney = (idAccount, count) => {
		let account = document.querySelector(`div[data-id="${idAccount}"]`);
		let countMoney = +account.dataset.countMoney;
		countMoney += +count;
		account.dataset.countMoney = countMoney.toFixed(2);
		let rub = formatMoney(account.dataset.countMoney.split('.')[0]);
		let kop = account.dataset.countMoney.split('.')[1] ??= '00';		
		rub = rub + ' &#8381;';
		kop = '&nbsp;' + kop + ' &#162;';
		
		account.querySelectorAll('.countMoney')[0].innerHTML = rub;
		account.querySelectorAll('.countMoney')[1].innerHTML = kop;
	};
	
	let addOrUpdateCategory = () => {
		let category = Object.fromEntries(new FormData(document.getElementById('categoryForm')).entries());
		let data = `idCategory=${category.idCategory}&title=${category.titleCategory}&comment=${category.commentCategory}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/category/', data).then(response => {
			response = JSON.parse(response);
			let html = `<div class="category" data-id="${response.idCategory}" data-title="${response.title}" data-comment="${response.comment}">
			<div class="hidden">${response.idCategory}</div>
			<div class="titleCategory">${response.title}</div>
			<div class="comment">${response.comment}</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newCategory = dom.querySelector('.category');
			newCategory.addEventListener('click', getCategoryById);
			
			if (method == 'PUT') {
				document.querySelector('.categoryList').appendChild(newCategory);
				addOrUpdateCategorySelect(method, response);
			} else {
				currentEntity.innerHTML = newCategory.innerHTML;
				addOrUpdateCategorySelect(method, response);
			}
		}).catch(error => {
			alert(error);
		});
	};
	
	let addOrUpdateCategorySelect = (method, category) => {
		let select = document.querySelectorAll('select#idCategory');
		if (method == 'PUT') {
			for (let i = 0; i < select.length; i++) {
				select[i].innerHTML += `<option value="${category.idCategory}">${category.title}</option>`;
			}
		} else if (method == 'POST') {
			for (let i = 0; i < select.length; i++) {
				for (let j = 0; j < select[i].options.length; j++) {
					if (select[i][j].value == category.idCategory)
						select[i][j].innerHTML = category.title;
				}
			}
		}
	};
	
	document.getElementById('categoryAddOk').addEventListener('click', addOrUpdateCategory);
	document.getElementById('categoryUpdateOk').addEventListener('click', addOrUpdateCategory);
	
	let updateCharts = () => {
		ajax('GET', '/charts/').then(response => {
			let chart = document.querySelector('.chart');
			chart.innerHTML = response;
		}).catch(error => {
			alert(error);
		});

	};	
});