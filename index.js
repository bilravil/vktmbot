'use strict';

const express = require('express');
const VK = require('vksdk');
const tm_bot = require('./server/tm.js');
var app = express();
var http = require('http').Server(app);
var http1 = require('http');


const Message = require('./server/message.js');
const Account = require('./server/account.js');
const Friends = require('./server/friends.js');
const Users = require('./server/users.js');
const config = require('./config.json');

const vk = new VK({
   'appId'     : config.vk.appId,
   'appSecret' : config.vk.appSecret,
   'language'  : 'ru'
});
vk.setSecureRequests(true);


vk.on('http-error', function(_e) {
    console.log(_e);
});
vk.on('parse-error', function(_e) {
    console.log(_e);
});

var data = {} ;

var api = {
	init : function(id,chatId,vk_id,token) { 
		data[id] = { 
			message : new Message(api,id), 
			account : new Account(api,id),
			friends : new Friends(api,id,vk_id),
			chatId : chatId,
			vk_id : vk_id,
			vk_status : true,
			menu_item : 'main',
			new_msg : 0,
			vk_bot : { state : true , timer : 150000, text : "Ваше сообщение прочитано , Вам ответят позднее.С наилучшими пожеланиями, бот Иван."} ,
			vk : function() { vk.setToken(token); return vk ; }
		} 
		setInterval(data[id].account.setOnline,300000);
	},
	users : function() { return Users ;},
	setPrev : function(id,prevUser) { data[id].prevUser = prevUser },
	setCur : function(id,curUser) { data[id].curUser = curUser },
	setLastMsg : function(id,msgId) { data[id].lastMsg = msgId },
	setMenuItem : function(id,item) { data[id].menu_item = item },
	get : function(id) { return data[id]; }
}
http.listen(process.env.PORT || 5000);
tm_bot.Run(config,api, function(name){ console.log(name + ' started.'); });