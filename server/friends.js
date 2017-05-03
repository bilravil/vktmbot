'use strict';
const request = require('request');
const tm = require('./tm.js');

class Friends {
	get(user_id){
		const options = {  
		    url: 'https://api.vk.com/method/friends.get?v=5.52&access_token=ae39c04e191c8c304d9725b5991cd195202265fa36daf36c29d9cf19221e0ee9827506f56cb8ededa46c3',
		    method: 'POST',
		    json : true,
		    qs : { "user_id":user_id, "order" : "random" , "count" : 15, "fields" : "city,online"}
		};
		return new Promise(function(resolve, reject){	
			request(options, function(err, res, body) {  			    
			    if (err) { 
		            console.log(err);
		            tm.Send("Ошибка при получении  списка друзей."); 
		            reject(err);
		        }  
		        resolve(body.response.items);
			});
		});
	}

	search(user_id,q){
		const options = {  
		    url: 'https://api.vk.com/method/friends.search?v=5.52&access_token=ae39c04e191c8c304d9725b5991cd195202265fa36daf36c29d9cf19221e0ee9827506f56cb8ededa46c3',
		    method: 'POST',
		    json : true,
		    qs : { "user_id":user_id,"q" : q, "fields" : "city,online"}
		};
		return new Promise(function(resolve, reject){	
			request(options, function(err, res, body) {  			    
			    if (err) { 
		            console.log(err);
		            tm.Send("Ошибка при получении  списка друзей."); 
		            reject(err);
		        }  
		        resolve(body.response.items);
			});
		});
	}
}

module.exports = Friends;