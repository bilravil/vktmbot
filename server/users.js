'use strict';
const request = require('request');

class Users {
	static  get(api,id,user_id) {
		return new Promise(function(resolve, reject){
			api.get(id).vk().request('users.get', { "user_ids":user_id }, function(body) {
				resolve(body.response); 
			});
		});    	
    }

}

module.exports = Users;