 'use strict';
const request = require('request');
const tm = require('./tm.js');

class Account  {
	constructor (api){
		this.api = api;
		this.setOnline = this.setOnline.bind(this);
	}

	setOnline() {
		this.api.vk().request('account.setOnline', {}, function(body) {});
	}
}

module.exports = Account;