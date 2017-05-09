'use strict';

const express = require('express');
const VK = require('vksdk');
const tm_bot = require('./server/tm.js');
var app = express();
var http = require('http').Server(app);
var http1 = require('http');
const emoji = require('node-emoji');

const Message = require('./server/message.js');
const Account = require('./server/account.js');
const Friends = require('./server/friends.js');
const Users = require('./server/users.js');
const config = require('./config.json');

const log4js = require('log4js');
const logger = log4js.getLogger();
//logger.level = 'debug';

const vk = new VK({
   'appId'     : config.vk.appId,
   'appSecret' : config.vk.appSecret,
   'language'  : 'ru'
});
vk.setSecureRequests(true);


vk.on('http-error', function(_e) {
    console.log(_e);
    logger.debug("http-error" + _e);
});
vk.on('parse-error', function(_e) {
    console.log(_e);
    logger.debug("parse-error" + _e);
});

http.on('error', function(err) {
	console.log(err);
	logger.debug("error" + err);
});

var data = {} ;

var api = {
	init : function(id,chatId,vk_id,token) { 
		data[id] = { 
			message : new Message(api,id,logger), 
			account : new Account(api,id),
			friends : new Friends(api,id,vk_id),
			chatId : chatId,
			vk_id : vk_id,			
			menu_item : 'main',
			dialogs : { menu : [[`Меню ${emoji.get('star')}`,`Сообщения${emoji.get('speech_balloon')}`],[]]	},
			new_msg : 0,
			vk_bot : { state : true , timer : 150000, text : "Привет, я пока не могу ответить, сделаю это чуть позже. Это сообщение отправлено ботом Иваном из https://t.me/VkAssistBot"} ,
			vk_status : true,
			dialog_offset : 0,
			chat_offset : 0,
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
tm_bot.Run(config,api,logger, function(name){ console.log(name + ' started.'); });

process.on('uncaughtException', function(err) {
    console.log(err);
});