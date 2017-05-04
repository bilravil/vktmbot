'use strict';
const request = require('request');

class Users {
	static  get(api,user_id) {
		return new Promise(function(resolve, reject){
			api.vk().request('users.get', { "user_ids":user_id }, function(body) {
				resolve(body.response); 
			});
		});    	
    }

}

module.exports = Users;