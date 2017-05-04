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
vk.setToken(config.vk.access_token);

vk.on('http-error', function(_e) {
    console.log(_e);
});
vk.on('parse-error', function(_e) {
    console.log(_e);
});

var data = {} ;

var api = {
	init : function(id,chatId) { 
		data[id] = { 
			message : new Message(id,api), 
			account : new Account(api),
			friends : new Friends(api,26194851),
			chatId : chatId
		} 
		setInterval(data[id].account.setOnline,5000);
	},
	vk : function() { return vk ; },
	users : function() { return Users ;},
	setPrev : function(id,prevUser) { data[id].prevUser = prevUser },
	setCur : function(id,curUser) { data[id].curUser = curUser },
	setLastMsg : function(id,msgId) { data[id].lastMsg = msgId },
	get : function(id) { return data[id]; }
}
http.listen(process.env.PORT || 5000);
tm_bot.Run(config,api, function(name){ console.log(name + ' started.'); });

setInterval(function() {
    http1.get("http://afternoon-chamber-76804.herokuapp.com");
}, 300000);