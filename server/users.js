'use strict';
const request = require('request');

class Users {
	static  get(user_id) {
		return new Promise(function(resolve, reject){
			var url = 'https://api.vk.com/method/users.get?v=5.52&access_token=d888599d890ca610f9ec0cd8bc35cea101a0adb7a166035f5730bbac1b6c89365ab462275d761eb70db91&user_ids='+user_id;
		    request.post({url: url,method: "POST",json: true } , function (err, remoteResponse, remoteBody) {
		        if (err) { 
		            console.log(err); 
		            reject("error");
		        }  
		        resolve(remoteBody.response[0]);                    
		    });
		});	    	
    }

}

module.exports = Users;