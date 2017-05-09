'use strict';
const request = require('request');
const tm = require('./tm.js');

class Friends {
	constructor (api,id,user_id){
		this.id = id;
		this.api = api;
		this.user_id = user_id;
		this.get = this.get.bind(this);
		this.search = this.search.bind(this);
	}
	get(){
		let api = this.api;
		let user_id = this.user_id;
		let id = this.id;
		return new Promise(function(resolve, reject){
			api.get(id).vk().request('friends.get', {'user_id' : user_id,"order" : "hints" , "count" : 15, "fields" : "city,online"}, function(body) {
			    resolve(body.response.items);
			});
		});
	}

	search(q){
		let api = this.api;
		let user_id = this.user_id;
		let id = this.id;
		return new Promise(function(resolve, reject){
			api.get(id).vk().request('friends.search', { "user_id" : user_id,"q" : q, "fields" : "city,online"}, function(body) {
			    resolve(body.response.items);
			});
		});
	}
}

module.exports = Friends;