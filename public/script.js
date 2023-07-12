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
		let id = currentEntity.querySelector('.hidden').innerText;
		
		ajax('GET', '/income/' + id).then(response => {
			currentDialog.showModal();
			currentDialog.querySelector('#idIncome').value = response.idIncome;
			currentDialog.querySelector('#categoryIncome').value = response.categoryIncome;
			currentDialog.querySelector('#dateIncome').value = response.date;
			currentDialog.querySelector('#countIncome').value = response.countIncome;
			
			hiddenEntityUpdate('income');
		}).catch(e => {
			alert(e);
		});
	};
	
	let incomeList = document.querySelectorAll('.incomeRecord');
	for (let i = 0; i < incomeList.length; i++) {
		incomeList[i].addEventListener('click', getIncomeById);
	}	
	
	let getCostById = (event) => {
		currentEntity = event.currentTarget;
		let id = currentEntity.querySelector('.hidden').innerText;
		
		ajax('GET', '/cost/' + id).then(response => {
			currentDialog.showModal();
			currentDialog.querySelector('#idCost').value = response.idCost;
			currentDialog.querySelector('#categoryCost').value = response.categoryCost;
			currentDialog.querySelector('#dateCost').value = response.date;
			currentDialog.querySelector('#countCost').value = response.countCost;
			
			hiddenEntityUpdate('cost');
		}).catch(e => {
			alert(e);
		});
	};
	
	let costList = document.querySelectorAll('.costRecord');
	for (let i = 0; i < costList.length; i++) {
		costList[i].addEventListener('click', getCostById);
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
			
			if (method == 'PUT')
				document.querySelector('.bankAccountList').appendChild(newAccount);
			else
				currentEntity.innerHTML = newAccount.innerHTML;
		}).catch(e => {
			alert(e);
		});
	};
	
	document.getElementById('accountAddOk').addEventListener('click', addOrUpdateAccount);
	document.getElementById('accountUpdateOk').addEventListener('click', addOrUpdateAccount);
	
	let addOrUpdateIncome = (event) => {
		let income = Object.fromEntries(new FormData(document.getElementById('incomeForm')).entries());
		if (income.countMoney <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		let data = `idIncome=${income.idIncome}&date=${income.dateIncome}&categoryIncome=${income.categoryIncome}&countIncome=${income.countIncome}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/income/', data).then(response => {
			let html = `<div class="incomeRecord">
			<div class="hidden">${response.idIncome}</div>
			<div>${response.date}</div>
			<div>${response.categoryIncome}</div>
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
		if (cost.countMoney <= 0) {
			alert('Сумма не должна быть меньше или раной нулю.');
			return;
		}
		let data = `idCost=${cost.idCost}&date=${cost.dateCost}&categoryCost=${cost.categoryCost}&countCost=${cost.countCost}`;
		let method = event.target.value == 'Create' ? 'PUT' : 'POST';
		
		ajax(method, '/cost/', data).then(response => {
			let html = `<div class="costRecord">
			<div class="hidden">${response.idCost}</div>
			<div>${response.date}</div>
			<div>${response.categoryCost}</div>
			<div>${response.countCost} &#8381;</div>
			</div>`;
			
			currentDialog.close();
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let newCost = dom.querySelector('.costRecord');
			newCost.addEventListener('click', getIncomeById);
			
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
	
	document.getElementById('addNewCategoryDialogOk').addEventListener('click', () => {
		let titleCategory = document.getElementById('titleCategory').value;
		let commentCategory = document.getElementById('commentCategory').value;
		
		let data = `title=${titleCategory}&comment=${commentCategory}`;
		ajax('PUT', '/category/', data).then(response => {
			let html = `<div class="category">
			<div class="hidden">${response.idCategory}</div>
			<div class="titleCategory">${response.title}</div>
			<div class="comment">${response.comment}</div>
			</div>`;
			
			let dom = new DOMParser().parseFromString(html, 'text/html');
			let element = dom.querySelector('.category');
			currentDialog.close();
			document.querySelector('.categoryList').appendChild(element);
		}).catch(e => {
			alert(e);
		});	
	});
	
	let listCategory = document.querySelectorAll('.titleCategory');
	
	for (let i = 0; i < listCategory.length; i++) {
		listCategory[i].addEventListener('click', (event) => {
			let element = event.target;
			element.firstChild()
			// console.log(element);

		});
	}
});
