'use strict';
const request = require('request');
const Users = require('./users.js');
const LongPoll = require('./longpoll.js');
const tm = require('./tm.js');
const emoji = require('node-emoji');

class Message {
    constructor (api,id){   
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
        let title = i[5];
        let user_id = title === ' ... ' ? i[3] : i[7].from ;        
        let text = i[6];
        // личные
        if(title === " ... " &&  api.get(id).lastMsg !== msg_id){
            Users.get(api,id,user_id).then(result => {
                let user = {};
                user.first_name = result[0].first_name;
                user.last_name = result[0].last_name;
                i[7] = user;
                let msg = `${i[7].first_name} ${i[7].last_name}(/write${i[3]} ${emoji.get('email')})  : \n${i[6]} `; 
                tm.Send(api,id,msg);
                api.setLastMsg(id,msg_id);  
                api.setCur(id,user_id); 
                api.setMenuItem(id,'write_msg');
            },error => {
                console.log("Rejected: " + error); 
            }) 
        } 
        // беседа
        if(title !== " ... " &&  api.get(id).lastMsg !== msg_id){
            Users.get(api,id,user_id).then(result => {
                let user = {};
                user.first_name = result[0].first_name;
                user.last_name = result[0].last_name;
                i[8] = user;
                let msg = `${title} (/chat${user_id}) \n${i[8].first_name} : ${i[6]} `; 
                tm.Send(api,id,msg);
                api.setLastMsg(id,msg_id);  
                api.setCur(id,user_id); 
                api.setMenuItem(id,'write_msg');
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
            api.get(id).vk().request('messages.getById', {"message_ids" : message_ids}, function(body) {
                body.response.items.map(i => {                                  
                    if(i.title === " ... " && i.read_state === 0 && api.get(id).prevUser !== i.user_id){
                        api.setPrev(id,i.user_id); 
                        api.get(id).vk().request('messages.send', { "user_ids":i.user_id, "message" : api.get(id).vk_bot.text}, function(body) {});                 
                    }                               
                });  
            });
        }
    }   

    //отправить сбщ в вк
    send(peer_id,msg) {
        this.api.get(this.id).vk().request('messages.send', { "peer_id":peer_id , "message" : msg }, function(body) {});
    }

    getDialogs (){
        let api = this.api;
        let id = this.id;
        return new Promise(function(resolve, reject){
            api.get(id).vk().request('messages.getDialogs', {'count' : 5}, function(body) {
                resolve(body.response.items);
            });
        });
    }

    getHistory (peer_id){
        let api = this.api;
        let id = this.id;
        return new Promise(function(resolve, reject){
            api.get(id).vk().request('messages.getHistory', {'count' : 10 , "peer_id" : peer_id}, function(body) {
                resolve(body.response.items);
            });
        });
    }

    // пометить сбщ как прочитанное
    markAsRead(message_ids){
        let api = this.api;
        let id = this.id;
        api.get(id).vk().request('messages.markAsRead', {'message_ids' : message_ids}, function(body) {
            
        });
    }

    // запуск пулл сервера
    getLongPollServer(){
        let id = this.id;
        let api = this.api;
        api.get(id).vk().request('messages.getLongPollServer', { }, function(body) {
            let key = body.response.key; 
            let server = body.response.server;
            let ts = body.response.ts; 
            LongPoll.runLP(key,server,ts,id,api);
        });
    }
}

module.exports = Message;