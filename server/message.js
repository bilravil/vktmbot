'use strict';
const request = require('request');
const Users = require('./users.js');
const LongPoll = require('./longpoll.js');
const tm = require('./tm.js');
const emoji = require('node-emoji');
const main_menu = require('./menu/main_menu.js');



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
        this.handleMessage = this.handleMessage.bind(this);
        this.handleAttch = this.handleAttch.bind(this);
    }

    handleMessage(i){
        console.log(i);
        let id = this.id;
        let api = this.api;

        let sendToTm = this.sendToTm.bind(this);
        let getById = this.getById.bind(this);
        let sendByBot = this.sendByBot.bind(this);

        let msg_id = i[1];
        let type = i[5] === ' ... ' ? 'dialog' : 'chat';
        let fwd = i[7].fwd === undefined ? false : true;
        
        if(type === 'dialog' && (api.get(id).vk_bot.state === true)){
            setTimeout( sendByBot(msg_id), parseInt(api.get(id).vk_bot.timer));
        }
        if(type === 'dialog' && !fwd )  sendToTm(i);
        else if(type === 'chat' && !fwd ) sendToTm(i);
        else if(type === 'dialog' && fwd ) getById(msg_id);
        else if(type === 'chat' && fwd ) getById(msg_id);
    }


    // отпрваить новые сбщ в телеграм
    sendToTm(i) {                
        let id = this.id;
        let api = this.api;
        let msg_id = i[1];
        let title = i[5];
        let user_id = title === ' ... ' ? i[3] : i[7].from ;        
        let text = i[6];
        let attch = i[7].attach1 === undefined ? false: true;
        let handleAttch = this.handleAttch.bind(this);
        if(api.get(id).lastMsg !== msg_id){
            Users.get(api,id,user_id).then(result => {
                if(attch){
                    handleAttch(msg_id).then(attch => {
                        if(attch.photo !== undefined) attch.photo.map((i,index) =>{tm.SendPhoto(api,id,i);});
                        if(attch.doc !== undefined) attch.doc.map((i,index) =>{tm.SendDoc(api,id,i);});
                    });
                }
                let user = {};
                user.first_name = result[0].first_name;
                user.last_name = result[0].last_name;    

                if(title === ' ... ') i[7] = user; else i[8] = user;
                let msg = title === ' ... ' ?
                `${user.first_name} ${user.last_name}  : \n${i[6]} ` :
                `${title} \n${i[8].first_name} : ${i[6]} ` ;  


                api.get(id).new_msg += 1;
                let new_msg = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                          [{ text: msg, callback_data: `/chat${user_id};${msg_id}` }]
                        ]
                    })
                };
                tm.Send(api,id,`Новых сообщений : ${api.get(id).new_msg}`,new_msg);
                api.setLastMsg(id,msg_id);  
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
                    getFwdUsers(i,i.from_id).then(fwd => {console.log(fwd); resolve(fwd); }).catch(error=>{console.log(error);});            
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
                            let user_id = k.title === ' ... ' ? k.user_id : k.from ; 
                            let title = k.title === ' ... ' ? 
                            `${user[k.user_id].first_name} ${user[k.user_id].last_name}` 
                            : k.title + ` : \n${user[k.user_id].first_name} ${user[k.user_id].last_name}`
                            let msg = `${title}  : \n${body} \n  ${fwd_messages}`; 
                            api.get(id).new_msg += 1;
                            let new_msg = {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                      [{ text: title, callback_data: `/chat${user_id};${k.id}` }]
                                    ]
                                })
                            };
                            tm.Send(api,id,`Новых сообщений : ${api.get(id).new_msg}`,new_msg);
                            tm.Send(api,id,msg);
                            api.setLastMsg(id,k.id);  
                            api.setMenuItem(id,'write_msg');
                        }).catch(error=>{console.log(error);});                        
                        });
                    }).catch(error=>{console.log(error);}); 
                }).catch(error=>{console.log(error);});                                 
                                           
            });  
        });
    }

    // получение диалогов
    getDialogs (){
        let api = this.api;
        let id = this.id;
        let  getFwdMessages = this.getFwdMessages.bind(this);
        let  getFwdUsers = this.getFwdUsers.bind(this);
        api.get(id).vk().request('messages.getDialogs', {'count' : 5}, function(body) {
            let result = body.response.items;
            let user_ids = ``;    
            // определяем список id из диалогов     
            return new Promise(function(resolve, reject){ 
                result.map((i ,index ) => { 
                    i = i.message;
                    getFwdUsers(i,i.user_id).then( fwd => {                      
                        user_ids += fwd + ',';
                        if(index == result.length-1) resolve(user_ids);
                    }).catch(error=>{console.log(error);
                    });          
                }); 
            })  
            // определяем данные пользователей
            .then(users_list => {    
                api.users().get(api,id,users_list).then(users => {  
                    let data = {};
                    return new Promise(function(resolve, reject){ 
                        users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);});
                    })
            })
            .then(user => {    
                result.map((k,index) =>{  
                    let i = k.message;
                    let fwd_arr = i.fwd_messages === undefined ? undefined : i.fwd_messages;
                    return new Promise(function(resolve, reject){ 
                        if(fwd_arr === undefined) resolve('');
                        else getFwdMessages(fwd_arr,user).then(fwd => { resolve(fwd); }).catch(error=>{console.log(error);});            
                    }).then(fwd_messages => {
                        let fwd = fwd_messages !== '' ? `\n  Пересланное сбщ : ${fwd_messages}` : '';
                        let list = ``;  
                        let m = i.out === 0 ? i.user_id : api.get(id).vk_id; 
                        let title = i.title === ' ... ' ? `${user[i.user_id].first_name} ${user[i.user_id].last_name}` : i.title;
                        let chat = i.title === ' ... ' ? `chat${i.user_id} ${emoji.get('speech_balloon')}` : `chat0${i.chat_id} ${emoji.get('speech_balloon')}`;  
                        list = `${title} /${chat} \n${user[m].first_name} : ${i.body} ${fwd}\n`;                
                        setTimeout(function(){ tm.Send(api,id,list)},index*200); 
                    }) 
                });   
            });                             
            }),error => { console.log("Rejected: " + error);  } 
        });            
    }

    // получении сообщений из опред. диалога
    getHistory (resp){
        let api = this.api;
        let id = this.id;
        let  getFwdMessages = this.getFwdMessages.bind(this);
        let  getFwdUsers = this.getFwdUsers.bind(this);
        let peer_id = resp.charAt(0) === '0' ? 2000000000 + parseInt(resp) : parseInt(resp);
        api.setCur(id,peer_id);
        api.get(id).vk().request('messages.getHistory', {'count' : 10 , "peer_id" : peer_id}, function(body) {
            let result = body.response.items;
            let user_ids = ``;                 
            return new Promise(function(resolve, reject){ 
                result.map((i ,index ) => { 
                    getFwdUsers(i,i.from_id).then( fwd => {
                        user_ids += fwd + ',';
                        if(index == result.length-1) resolve(user_ids);
                    }).catch(error=>{console.log(error);
                    });          
                }); 
            })           
            .then(users_list => {                        
                api.users().get(api,id,users_list).then(users => {  
                    let data = {};
                    return new Promise(function(resolve, reject){ 
                        users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);});
                    })
            .then(user => {  
                result = result.reverse();
                result.map((i,index) =>{   
                    let fwd_arr = i.fwd_messages === undefined ? undefined : i.fwd_messages; 
                    return new Promise(function(resolve, reject){ 
                        if(fwd_arr === undefined) resolve('');
                        else getFwdMessages(fwd_arr,user).then(fwd => { resolve(fwd); }).catch(error=>{console.log(error);});            
                    }).then(fwd_messages => {
                        let fwd = fwd_messages !== '' ? `\n  Пересланное сбщ : ${fwd_messages}` : '';
                        let list = ``;                     
                        var time = new Date(Date.UTC(1970, 0, 1)); 
                        time.setSeconds(i.date);                    
                        var date = time.getHours() + ":" + time.getMinutes();
                        list = `${user[i.user_id].first_name} ${user[i.user_id].last_name} ${date} \n ${i.body}  ${fwd}\n`; 
                        setTimeout(function(){ tm.Send(api,id,list)},index*200);
                    })  
                    
                });
            }),error => { console.log("Rejected: " + error);  };                       
            }),error => { console.log("Rejected: " + error);  };    
            }),error => { console.log("Rejected: " + error);  };    
        });     
    }

    getFwdUsers(fwd_arr,user_id){
        return new Promise(function(resolve, reject){ 
            if(fwd_arr.fwd_messages === undefined) resolve(user_id);
            else {

                let fwd_users = fwd_arr.user_id+',';
                fwd_arr = fwd_arr.fwd_messages;
                
                (function get(fwd_arr) {
                    fwd_arr.map((i ,index ) => { 
                        fwd_users += i.user_id + `,` ;
                        if(i.fwd_messages !== undefined) get(i.fwd_messages,user_id);
                        if(i.fwd_messages == undefined && index == fwd_arr.length-1) { resolve(fwd_users);};
                    });
                    
                })(fwd_arr,user_id);
                }
        });

    }

    getFwdMessages(fwd_arr,user){
        return new Promise(function(resolve, reject){ 
            let fwd_messages = ``;
            (function get(fwd_arr) {
                fwd_arr.map((i ,index ) => { 
                    let body = i.body === '' ? 'Пересланное сбщ:' : i.body ;
                    fwd_messages += `${user[i.user_id].first_name} ${user[i.user_id].last_name} : ${body} \n    ` ;
                    if(i.fwd_messages !== undefined) get(i.fwd_messages );
                    if(i.fwd_messages == undefined && index == fwd_arr.length-1) { resolve(fwd_messages);};
                });
                
            })(fwd_arr);
        });
    }

    handleAttch(message_id){
        let id = this.id;
        let api = this.api;
        return new Promise(function(resolve, reject){ 
           
            api.get(id).vk().request('messages.getById', {'message_ids' : message_id}, function(body) {
                let attchs = [];
                body.response.items[0].attachments.map((i,index) =>{
                    if(i.type === 'photo'){
                        let url ;
                        if(i.photo.photo_75 !== undefined) url = i.photo.photo_75;
                        if(i.photo.photo_130 !== undefined) url = i.photo.photo_130;
                        if(i.photo.photo_604 !== undefined) url = i.photo.photo_604;
                        if(i.photo.photo_807 !== undefined) url = i.photo.photo_807;
                        if(i.photo.photo_1280 !== undefined) url = i.photo.photo_1280;
                        attchs.push(url);
                        if(index == body.response.items[0].attachments.length-1) resolve({"photo":attchs});
                    }
                    if(i.type === 'doc'){
                        let url = i.doc.url;
                        attchs.push(url);
                        if(index == body.response.items[0].attachments.length-1) resolve({"doc":attchs});
                    }
                    
                })
                
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