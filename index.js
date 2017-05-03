'use strict';

const express = require('express');

const tm_bot = require('./server/tm.js');
const Message = require('./server/message.js');
const Account = require('./server/account.js');
const Friends = require('./server/friends.js');

var app = express();
var http = require('http').Server(app);
var http1 = require('http');

var data = {} ;

var api = {
	init : function(id) { 
		data[id] = { 
			message : new Message(), 
			account : new Account(),
			friends : new Friends()
		} 
		setInterval(data[id].account.setOnline,300000);
	},
	setPrev : function(id,prevUser) { data[id].prevUser = prevUser },
	setCur : function(id,curUser) { data[id].curUser = curUser },
	setLastMsg : function(id,msgId) { data[id].lastMsg = msgId },
	get : function(id) { return data[id]; }
}
http.listen(process.env.PORT || 5000);
tm_bot.Run(api, function(name){ console.log(name + ' started.'); });

setInterval(function() {
    http1.get("http://afternoon-chamber-76804.herokuapp.com");
}, 300000);