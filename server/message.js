'use strict';
const request = require('request');
const Users = require('./users.js');
const LongPoll = require('./longpoll.js');
const tm = require('./tm.js');


class Message {
	constructor (id,api){
		this.id = id;
		this.api = api;
		this.sendToTm = this.sendToTm.bind(this);
		this.sendByBot = this.sendByBot.bind(this);
		this.send = this.send.bind(this);
		this.getDialogs = this.getDialogs.bind(this);
		this.markAsRead = this.markAsRead.bind(this);
		this.getLongPollServer = this.getLongPollServer.bind(this);
		this.getHistory = this.getHistory.bind(this);
	}

	// отпрваить новые сбщ в телеграм
	sendToTm(i) {
		let id = this.id;
		let api = this.api;
		let msg_id = i[1];
		let user_id = i[3];
		let date = i[4];
		let title = i[5];
		let text = i[6];
        if(title === " ... " &&  api.get(id).lastMsg !== msg_id){
        	Users.get(api,user_id).then(result => {
            	let user = {};
            	user.first_name = result[0].first_name;
            	user.last_name = result[0].last_name;
            	i[7] = user;
            	tm.Send(api,id,i);
            	api.setLastMsg(id,msg_id);  
            },error => {
            	console.log("Rejected: " + error); 
            }) 
        } 
	}
	// автоответчик для вк
	sendByBot(message_ids) {
		let api = this.api;
		let id = this.id;
		return function(){
			api.vk().request('messages.getById', {"message_ids" : message_ids}, function(body) {

				body.response.items.map(i => {  	                             
	                if(i.title === " ... " && i.read_state === 0 && api.get(id).prevUser !== i.user_id){
	                    api.setPrev(id,i.user_id); 
	                    api.vk().request('messages.send', { "user_ids":i.user_id, "message" : "Ваше сообщение прочитано , Вам ответят позднее.С наилучшими пожеланиями, бот Иван."}, function(body) {});                 
	                }                               
	            });	 
			});
    	}
	}	

	send(user_id,msg) {
        this.api.vk().request('messages.send', { "user_ids":user_id , "message" : msg }, function(body) {});
	}

	getDialogs (){
		let api = this.api;
		return new Promise(function(resolve, reject){
			api.vk().request('messages.getDialogs', {'count' : 5}, function(body) {
			    resolve(body.response.items);
			});
		});
	}

	getHistory (peer_id){
		let api = this.api;
		return new Promise(function(resolve, reject){
			api.vk().request('messages.getHistory', {'count' : 10 , "peer_id" : peer_id}, function(body) {
			    resolve(body.response.items);
			});
		});
	}

	markAsRead(message_ids){
		let api = this.api;
		api.vk().request('messages.markAsRead', {'message_ids' : message_ids}, function(body) {
		    
		});
	}

	// запуск пулл сервера
	getLongPollServer(){
		let id = this.id;
		let api = this.api;
		api.vk().request('messages.getLongPollServer', { }, function(body) {
			let key = body.response.key; 
	        let server = body.response.server;
	        let ts = body.response.ts; 
	        LongPoll.runLP(key,server,ts,id,api);
		});
	}
}

module.exports = Message;