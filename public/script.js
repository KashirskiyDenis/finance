'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let addNew = document.getElementById('addNew');
	
	let currentContent = document.getElementById('contentAccounts');
	let currentDialog = document.getElementById('accountsDialog');;
	let currentMenu = document.getElementById('accounts');;
	
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
	
	function activeContent(content) {
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
});