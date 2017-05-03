 'use strict';
const request = require('request');
const tm = require('./tm.js');

class Account  {

	setOnline()  {
    	var url = 'https://api.vk.com/method/account.setOnline?v=5.52&access_token=d888599d890ca610f9ec0cd8bc35cea101a0adb7a166035f5730bbac1b6c89365ab462275d761eb70db91';
	    request.post({url: url,method: "POST",json: true} , function (err, remoteResponse, remoteBody) {
	        if (err) { 
	            console.log(err);
	            tm.Send("Ошибка при смене статуса"); 
	        }                 
	    });
	}
}

module.exports = Account;