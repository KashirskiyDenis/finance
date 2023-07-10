'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addNew = document.getElementById('addNew');
	let currentContent = document.getElementById('accountContent');
	let currentDialogAdd = document.getElementById('accountDialogAdd');
	let currentMenu = document.getElementById('account');
	let currentUpdateElement = null;
	
	function activeMenu() {
		currentMenu.classList.remove('menuTab-active');
		this.classList.add('menuTab-active');
		
		if (this.id == 'statistics')
			addNew.style.display = 'none';
		else
			addNew.style.display = 'block';
		
		currentMenu = this;
		
		let content = document.getElementById(this.id + 'Content');
		currentDialogAdd = document.getElementById(this.id + 'DialogAdd');
		activeContent(content);
	}
	
	let activeContent = (content) => {
		currentContent.style.display = 'none'
		content.style.display = 'block';
		currentContent = content;
	}	
	
	addNew.addEventListener('click', () => {
		currentDialogAdd.showModal();
	});
	
	function closeDialogWindow() {
		document.getElementById(this.dataset.dialog).close();
	};
	
	let menu = document.querySelectorAll('.menuTab');
	for (let i = 0; i < menu.length; i++) {
		menu[i].addEventListener('click', activeMenu);
	}
	
	let closeDialogButtons = document.querySelectorAll('input[data-cancel]');
	for (let i = 0; i < closeDialogButtons.length; i++) {
		closeDialogButtons[i].addEventListener('click', closeDialogWindow);
	}
	
	let resetForm = () => {
		let inputs = document.querySelectorAll('dialog > input[type=text], input[type=number]');
		let len = inputs.length;
		for (let i = 0; i < len; i++) {
			inputs[i].value = '';
		}		
	};
	
	let resetDialogButtons = document.querySelectorAll('input[data-reset]');
	for (let i = 0; i < resetDialogButtons.length; i++) {
		resetDialogButtons[i].addEventListener('click',resetForm);
	}
	
	const ajax = (type, url, data) => {
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
	
	let getAccountById = (event) => {
		currentUpdateElement = event.currentTarget;
		let id = currentUpdateElement.querySelector('.hidden').innerText;
		
		ajax('GET', '/account/' + id).then(response => {
			accountDialogUpdate.showModal();
			accountDialogUpdate.querySelector('#idAccount').value = response.idAccount;
			accountDialogUpdate.querySelector('#titleBank').value = response.titleBank;
			accountDialogUpdate.querySelector('#titleAccount').value = response.titleAccount;
			accountDialogUpdate.querySelector('#typeAccount').value = response.typeAccount;
			accountDialogUpdate.querySelector('#countMoney').value = response.countMoney;
		}).catch(e => {
			alert(e);
		});
	};
	
	let accountList = document.querySelectorAll('.accountCard');
	for (let i = 0; i < accountList.length; i++) {
		accountList[i].addEventListener('click', getAccountById);
	}

	document.getElementById('accountAddOk').addEventListener('click', () => {
		if (countMoney <= 0) {
			alert('Сумма не должна быть меньше нуля.');
			return;
		}
		
		let account = Object.fromEntries(new FormData(document.getElementById('accountFormAdd')).entries());
		let data = `titleBank=${account.titleBank}&titleAccount=${account.titleAccount}&typeAccount=${account.typeAccount}&countMoney=${account.countMoney}`;
		
		ajax('PUT', '/account/', data).then(response => {
			let countMoney = response.countMoney.toString();
			let rub = formatMoney(countMoney.split('.')[0]);
			let kop = countMoney.split('.')[1] ??= '00';
			
			let html = `<div class="accountCard">
			<p class="hidden">${response.idAccount}</p>			
			<p class="bankAccountTitle">${response.titleBank}</p>
			<p class="bankAccountInfo">${response.titleAccount}</p>
			<p class="bankAccountInfo">${response.typeAccount}</p>
			<p class="bankAccountInfo countMoney">${rub} &#8381;</p><p class="countMoney">&nbsp;${kop} &#162;</p>
			</div>`;
			currentDialogAdd.close();
			
			let dom = new DOMParser().parseFromString(html, "text/html");
			let newAccount = dom.querySelector('.accountCard');
			newAccount.addEventListener('click', getAccountById);
			
			document.querySelector('.bankAccountList').appendChild(newAccount);
		}).catch(e => {
			alert(e);
		});
	});
	
	document.getElementById('accountUpdateOk').addEventListener('click', () => {
		if (countMoney <= 0) {
			alert('Сумма не должна быть меньше нуля.');
			return;
		}
		
		let account = Object.fromEntries(new FormData(document.getElementById('accountFormUpdate')).entries());
		let data = `idAccount=${account.idAccount}&
			titleBank=${account.titleBank}&
			titleAccount=${account.titleAccount}&
			typeAccount=${account.typeAccount}&
			countMoney=${account.countMoney}`;
		
		ajax('POST', '/account/', data).then(response => {
			let countMoney = response.countMoney.toString();
			let rub = formatMoney(countMoney.split('.')[0]);
			let kop = countMoney.split('.')[1] ??= '00';
			
			let html = `<div class="accountCard">
			<p class="hidden">${response.idAccount}</p>			
			<p class="bankAccountTitle">${response.titleBank}</p>
			<p class="bankAccountInfo">${response.titleAccount}</p>
			<p class="bankAccountInfo">${response.typeAccount}</p>
			<p class="bankAccountInfo countMoney">${rub} &#8381;</p><p class="countMoney">&nbsp;${kop} &#162;</p>
			</div>`;
			currentDialogAdd.close();
			
			let dom = new DOMParser().parseFromString(html, "text/html");
			currentUpdateElement = dom.querySelector('.accountCard');
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
			
			let html = `<tr>
			<td>${response.date}</td>
			<td>${response.categoryIncome}</td>
			<td>${response.countIncome} &#8381;</td>
			</tr>`;
			
			currentDialogAdd.close();
			document.getElementById('tableIncome').innerHTML += html;
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
			
			let html = `<tr>
			<td>${response.date}</td>
			<td>${response.categoryCost}</td>
			<td>${response.countCost} &#8381;</td>
			</tr>`;
			
			currentDialogAdd.close();
			document.getElementById('tableCost').innerHTML += html;
			}).catch(e => {
			alert(e);
		});
	});
	
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
			
			let dom = new DOMParser().parseFromString(html, "text/html");
			let element = dom.querySelector('.category');
			currentDialogAdd.close();
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
