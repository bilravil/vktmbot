 'use strict';
const request = require('request');
const tm = require('./tm.js');

class Account  {
	constructor (api,id){
		this.id = id;
		this.api = api;
		this.setOnline = this.setOnline.bind(this);
	}

	setOnline() {
		this.api.get(this.id).vk().request('account.setOnline', {}, function(body) {});
	}
}

module.exports = Account;