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
        this.getById = this.getById.bind(this);
        this.getFwdMessages = this.getFwdMessages.bind(this);
        this.getFwdUsers = this.getFwdUsers.bind(this);
    }

    // отпрваить новые сбщ в телеграм
    sendToTm(i) {          
        let id = this.id;
        let api = this.api;
        let msg_id = i[1];
        let title = i[5];
        let user_id = title === ' ... ' ? i[3] : i[7].from ;        
        let text = i[6];
        if(api.get(id).lastMsg !== msg_id){
            Users.get(api,id,user_id).then(result => {
                let user = {};
                user.first_name = result[0].first_name;
                user.last_name = result[0].last_name;              
                if(title === ' ... ') i[7] = user; else i[8] = user;
                let msg = title === ' ... ' ?
                `${user.first_name} ${user.last_name}(/write${i[3]} ${emoji.get('email')})  : \n${i[6]} ` :
                `${title} (/chat${user_id}) \n${i[8].first_name} : ${i[6]} ` ; 
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

    getById (message_ids){
        let api = this.api;
        let id = this.id;
        let  getFwdMessages = this.getFwdMessages.bind(this);
        let  getFwdUsers = this.getFwdUsers.bind(this);
        api.get(id).vk().request('messages.getById', {"message_ids" : message_ids}, function(body) {
            body.response.items.map(i => {  
                let k = i;                                
                    let fwd_arr = i.fwd_messages;
                    let user_ids = ``;
                    // определяем id все юзеров из сбщ
                    return new Promise(function(resolve, reject){ 
                        getFwdUsers(fwd_arr).then(fwd => {console.log(fwd); resolve(fwd); }).catch(error=>{console.log(error);});            
                    })
                    .then(users_list => {    
                        api.users().get(api,id,users_list).then(users => {      
                            let data = {};
                            // определяем данные всех юзеров из сбщ
                            return new Promise(function(resolve, reject){ 
                                users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; 
                                if(index == users.length-1) { resolve(data);} });
                            })
                            .then(user => { 
                                let fwd_messages = ``;
                                 // определяем инфо из пересылаемых сбщ                                
                                return new Promise(function(resolve, reject){ 
                                    getFwdMessages(fwd_arr,user).then(fwd => { resolve(fwd); }).catch(error=>{console.log(error);});            
                                })
                            .then(fwd_messages => {
                                let body = i.body === '' ? 'Пересланное сбщ:' : i.body ;
                                let title = k.title === ' ... ' ? 
                                `${user[k.user_id].first_name} ${user[k.user_id].last_name} (/write${k.id} ${emoji.get('email')})` 
                                : k.title + ` (/chat${k.id} ${emoji.get('email')}) : \n${user[k.user_id].first_name} ${user[k.user_id].last_name}`
                                let msg = `${title}  : \n${body} \n  ${fwd_messages}`; 
                                tm.Send(api,id,msg);
                                api.setLastMsg(id,k.id);  
                                api.setCur(id,k.user_id); 
                                api.setMenuItem(id,'write_msg');
                            }).catch(error=>{console.log(error);});                        
                            });
                        }).catch(error=>{console.log(error);}); 
                    }).catch(error=>{console.log(error);});                                 
                                           
            });  
        });
    }

    getFwdMessages(fwd_arr,user){
        return new Promise(function(resolve, reject){ 
            let fwd_messages = ``;
            (function get(fwd_arr) {
                fwd_arr.map((i ,index ) => { 
                    console.log(i);
                    let body = i.body === '' ? 'Пересланное сбщ:' : i.body ;
                    fwd_messages += `${user[i.user_id].first_name} ${user[i.user_id].last_name} : ${body} \n    ` ;
                    if(i.fwd_messages !== undefined) get(i.fwd_messages );
                    if(i.fwd_messages == undefined && index == fwd_arr.length-1) { resolve(fwd_messages);};
                });
                
            })(fwd_arr);
        });
    }

    getFwdUsers(fwd_arr){
        return new Promise(function(resolve, reject){ 
            let fwd_users = ``;
            (function get(fwd_arr) {
                fwd_arr.map((i ,index ) => { 
                    fwd_users += i.user_id + `,` ;
                    if(i.fwd_messages !== undefined) get(i.fwd_messages );
                    if(i.fwd_messages == undefined && index == fwd_arr.length-1) { resolve(fwd_users);};
                });
                
            })(fwd_arr);
        });
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