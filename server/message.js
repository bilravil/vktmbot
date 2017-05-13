'use strict';
const request = require('request');
const Users = require('./users.js');
const LongPoll = require('./longpoll.js');
const tm = require('./tm.js');
const emoji = require('node-emoji');
const main_menu = require('./menu/main_menu.js');
const _ = require('underscore');


class Message {
    constructor (api,id,logger){   
        this.id = id;
        this.api = api;
        this.logger = logger;
        this.sendToTm = this.sendToTm.bind(this);
        this.sendByBot = this.sendByBot.bind(this);
        this.send = this.send.bind(this);
        this.getDialogs = this.getDialogs.bind(this);
        this.markAsRead = this.markAsRead.bind(this);
        this.getLongPollServer = this.getLongPollServer.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.getChat = this.getChat.bind(this);
        this.getById = this.getById.bind(this);
        this.getFwdMessages = this.getFwdMessages.bind(this);
        this.getFwdUsers = this.getFwdUsers.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleAttch = this.handleAttch.bind(this);
        
    }

    handleMessage(i){
        let id = this.id;
        let api = this.api;

        let sendToTm = this.sendToTm.bind(this);
        let getById = this.getById.bind(this);
        let sendByBot = this.sendByBot.bind(this);

        let msg_id = i[1];
        let type = i[5] === ' ... ' || i[5] === ''? 'dialog' : 'chat';
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
        this.logger.debug(api.get(id).vk_id + " - SendToTm");  
        let handleAttch = this.handleAttch.bind(this);

        let msg_id = i[1];
        let title = i[5];
        let user_id = title === ' ... ' ? i[3] : i[7].from ;        
        let text = i[6].replace(new RegExp('<br>', 'g'), '\n').replace(new RegExp('</br>', 'g'), '');
        let attch = i[7].attach1 === undefined ? false: true;
        if(api.get(id).lastMsg !== msg_id){
            Users.get(api,id,user_id).then(result => {
                let user = {};
                user.first_name = result[0].first_name;
                user.last_name = result[0].last_name;    

                if(title === ' ... ' || title === '') i[7] = user; else i[8] = user;
                let footer = `\n/write${i[3]} Ответить${emoji.get('email')}\n/mark${i[1]} Прочитано${emoji.get('incoming_envelope')}`;
                let msg = title === ' ... ' ?
                `${user.first_name} ${user.last_name}  : \n${text} ` :
                `${title} \n${i[8].first_name} ${i[8].last_name} : ${text} ` ;                  
                if(attch){
                    handleAttch(msg_id).then(attch => {

                        if(attch.photo !== undefined) attch.photo.map((i,index) =>{
                            if(api.get(id).curUser == i[3]) tm.SendPhoto(api,id,i,msg);
                            else tm.SendPhoto(api,id,i,msg+footer);
                         });
                        if(attch.doc !== undefined) attch.doc.map((i,index) =>{ 
                            if(api.get(id).curUser == i[3]) tm.SendDoc(api,id,i,msg);
                            else tm.SendDoc(api,id,i,msg+footer);
                            
                        });
                        if(attch.link !== undefined) attch.link.map((i,index) =>{
                            msg += '\n' + i;
                            if(api.get(id).curUser == i[3]) tm.Send(api,id,msg);
                            else tm.Send(api,id,msg+footer);
                        });
                        if(attch.audio !== undefined) attch.audio.map((i,index) =>{
                            if(api.get(id).curUser == i[3]) tm.SendAudio(api,id,i,msg);
                            else tm.SendAudio(api,id,i,msg+footer);
                            
                        });
                        if(attch.gift !== undefined) attch.gift.map((i,index) =>{
                            tm.SendPhoto(api,id,i,list,menu);
                        });

                    });
                }else {
                    if(api.get(id).curUser == i[3]) tm.Send(api,id,msg);
                    else  tm.Send(api,id,msg+footer);
                    api.setLastMsg(id,msg_id);  
                    api.setMenuItem(id,'write_msg');
                }
            },error => {
                console.log("Rejected: " + error); 
            }) 
        } 
    }

    getById (message_ids){
        let api = this.api;
        let id = this.id;
        this.logger.debug(api.get(id).vk_id + " - getById");  

        let  getFwdMessages = this.getFwdMessages.bind(this);
        let  getFwdUsers = this.getFwdUsers.bind(this);
        
        api.get(id).vk().request('messages.getById', {"message_ids" : message_ids}, function(body) {
            body.response.items.map(i => {  
                let k = i;                                
                let fwd_arr = i.fwd_messages;
                let user_ids = ``;
                // определяем id все юзеров из сбщ
                return new Promise(function(resolve, reject){ 
                    getFwdUsers(i,i.from_id).then(fwd => {resolve(fwd); }).catch(error=>{console.log(error);});            
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
                            let footer = `\n/write${user_id} Ответить${emoji.get('email')}\n/mark${i.id} Прочитано${emoji.get('incoming_envelope')}`;

                            let body = i.body === '' ? 'Пересланное сбщ:' : i.body.replace(new RegExp('<br>', 'g'), '\n').replace(new RegExp('</br>', 'g'), '') ;
                            
                            let user_id = k.title === ' ... ' || k.title === '' ? k.user_id : k.from ; 
                            
                            let title = k.title === ' ... ' | k.title === '' ? 
                            `${user[k.user_id].first_name} ${user[k.user_id].last_name}` 
                            : k.title + ` : \n${user[k.user_id].first_name} ${user[k.user_id].last_name}`
                            let msg = `${title}  : \n${body} \n  ${fwd_messages}`; 
                            
                            if(api.get(id).curUser == user_id) tm.Send(api,id,msg);
                            else  tm.Send(api,id,msg+footer);
                            
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
    getDialogs (offset = 0){
        
        let api = this.api;
        let id = this.id;
        let handleAttch = this.handleAttch.bind(this);
        this.logger.debug(api.get(id).vk_id + " - getDialogs"); 

        let  getFwdMessages = this.getFwdMessages.bind(this);
        let  getFwdUsers = this.getFwdUsers.bind(this);
        
        api.get(id).vk().request('messages.getDialogs', {'offset':offset,'count' : 5}, function(body) {
            let result = body.response.items;
            if(result.length === 0) {tm.Send(api,id,`Конец диалогам.`); return;}
            let user_ids = ``;    
            // определяем список id из диалогов     
            return new Promise(function(resolve, reject){ 
                result.map((i ,index ) => { 
                    i = i.message;
                    getFwdUsers(i,i.user_id).then( fwd => {                      
                        user_ids += fwd + ',';
                        if(index == result.length-1) {user_ids += api.get(id).vk_id; resolve(user_ids);}
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

                        let attch = i.attachments === undefined ? false: true;
                        let fwd = fwd_messages !== '' ? `\n  Пересланное сбщ : ${fwd_messages}` : '';
                        let list = ``;  
                        let m = i.out === 0 ? i.user_id : api.get(id).vk_id; 
                        let body = i.body.replace(new RegExp('<br>', 'g'), '\n').replace(new RegExp('</br>', 'g'), '')
                        let title = i.title === ' ... ' || i.title === ''  ? `${user[i.user_id].first_name} ${user[i.user_id].last_name}` : i.title;
                        let chat = i.title === ' ... ' || i.title === '' ? `chat${i.user_id} ${emoji.get('speech_balloon')}` : `chat0${i.chat_id} ${emoji.get('speech_balloon')}`;  
                        list = `${title} /${chat} \n${user[m].first_name} : ${body} ${fwd}\n`;
                        
                        let menu = index === result.length-1 ? main_menu.next_dialog_page() : {};
                        if(index === 0) menu = main_menu.dialogs(api.get(id).dialogs.menu);
                        if(attch){
                            handleAttch(i.id).then(attch => {
                                if(attch.photo !== undefined) attch.photo.map((i,index) =>{
                                   // tm.SendPhoto(api,id,i,list,menu);
                                    list += `\n ${i}`;
                                    tm.Send(api,id,list,menu);
                                });
                                if(attch.doc !== undefined) attch.doc.map((i,index) =>{
                                    list += `\n ${i}`;
                                    tm.Send(api,id,list,menu);
                                });
                                if(attch.link !== undefined) attch.link.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                })
                                if(attch.audio !== undefined) attch.audio.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                });
                                if(attch.gift !== undefined) attch.gift.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                })

                            });
                        }else  setTimeout(function(){ tm.Send(api,id,list,menu)},index*200); 
                    }) 
                });   
            });                             
            }),error => { console.log("Rejected: " + error);  } 
        });            
    }

    // получении сообщений из опред. диалога
    getHistory (resp,offset = 0){
        let api = this.api;
        let id = this.id;
        this.logger.debug(api.get(id).vk_id + " - getHistory");
        let getChat = this.getChat.bind(this);
        let handleAttch = this.handleAttch.bind(this);
        let  getFwdMessages = this.getFwdMessages.bind(this);
        let  getFwdUsers = this.getFwdUsers.bind(this);
        let peer_id = (resp.charAt(0) === '0'  ) ? 2000000000 + parseInt(resp) : parseInt(resp);    

        let title = (resp.charAt(0) === '0') ? getChat(resp).then(res=>title = res +` </chat${peer_id}>`) : ``;
        if(resp >= 2000000000) title = 'exist';
        api.setCur(id,peer_id);
        api.setMenuItem(id,'write_msg');

        api.get(id).vk().request('messages.getHistory', {'offset':offset,'count' : 10 , "peer_id" : peer_id}, function(body) {
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
                        
                        
                        if(title === '') title = `${user[i.user_id].first_name} ${user[i.user_id].last_name}</chat${peer_id}>`;
                        let menu  = index === result.length-1 ? main_menu.next_chat_page(title) : {};;
                        if(title !== 'exist') {
                             
                            if(index === 0) {                         
                                let dialogs = api.get(id).dialogs.menu[1];
                                if(!_.contains(dialogs, title)){
                                    api.get(id).dialogs.menu[1].push(title);                               
                                }                                                           
                                menu = main_menu.dialogs(api.get(id).dialogs.menu);             
                            }
                        }
                        let attch = i.attachments === undefined ? false: true;
                        let fwd = fwd_messages !== '' ? `\n  Пересланное сбщ : ${fwd_messages}` : '';
                        let list = ``;                     
                        var time = new Date(Date.UTC(1970, 0, 1)); 
                        time.setSeconds(i.date);                    
                        var date = time.getHours() + ":" + time.getMinutes();
                        let body = i.body.replace(new RegExp('<br>', 'g'), '\n').replace(new RegExp('</br>', 'g'), '')
                        list = `${user[i.from_id].first_name} ${user[i.from_id].last_name} ${date} \n ${body}  ${fwd}\n`;



                        if(attch){
                            handleAttch(i.id).then(attch => {
                                if(attch.photo !== undefined ) attch.photo.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                });
                                if(attch.doc !== undefined) attch.doc.map((i,index) =>{
                                    tm.SendDoc(api,id,i,list,menu);
                                });
                                if(attch.link !== undefined) attch.link.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                });
                                if(attch.audio !== undefined) attch.audio.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                });
                                if(attch.gift !== undefined) attch.gift.map((i,index) =>{
                                    list += '\n' + i;
                                    tm.Send(api,id,list,menu);
                                })

                            });
                        }else setTimeout(function(){ tm.Send(api,id,list,menu)},index*200);
                    })  
                    
                });
            }),error => { console.log("Rejected: " + error);  };                       
            }),error => { console.log("Rejected: " + error);  };    
            }),error => { console.log("Rejected: " + error);  };    
        });     
    }

    getChat(chat_id){
        return new Promise((resolve,reject) => this.api.get(this.id).vk().request('messages.getChat', { "chat_id":chat_id }, body => {
            let title =body.response.title;
            title =  title.length > 15 ?  title.substring(0,15) : title;
            resolve(title);
         }  ))
        
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
        let handleAttch = this.handleAttch.bind(this);
        let id = this.id;
        let api = this.api;
        return new Promise(function(resolve, reject){ 
            let fwd_messages = ``;
            (function get(fwd_arr) {      

                fwd_arr.map((i ,index ) => { 
                    let attch = i.attachments === undefined ? false: true;
                    let body = i.body === '' ? 'Пересланное сбщ:' : i.body.replace(new RegExp('<br>', 'g'), '\n').replace(new RegExp('</br>', 'g'), '') ;
                    fwd_messages += `${user[i.user_id].first_name} ${user[i.user_id].last_name} : ${body} \n    ` ;

                    if(attch){
                        handleAttch(0,i).then(attch => {
                            if(attch.photo !== undefined) attch.photo.map((i,index) =>{
                                fwd_messages += `\n ${i}`;
                                //tm.SendPhoto(api,id,i);
                            });
                            if(attch.doc !== undefined) attch.doc.map((i,index) =>{
                                fwd_messages += `\n ${i}`;
                                //tm.SendDoc(api,id,i);
                            });
                            if(attch.link !== undefined) attch.link.map((i,index) =>{
                                fwd_messages += `\n ${i}`;
                            });
                            if(attch.audio !== undefined) attch.audio.map((i,index) =>{
                                fwd_messages += `\n ${i}`;
                            });
                            if(attch.gift !== undefined) attch.gift.map((i,index) =>{
                                fwd_messages += `\n ${i}`;
                            });
                            if(i.fwd_messages !== undefined) get(i.fwd_messages );
                            if(i.fwd_messages == undefined && index == fwd_arr.length-1) { resolve(fwd_messages);};   
                        });                       
                    }else{
                        if(i.fwd_messages !== undefined) get(i.fwd_messages );
                        if(i.fwd_messages == undefined && index == fwd_arr.length-1) { resolve(fwd_messages);}; 
                    }
                    
                    
                });
                
            })(fwd_arr);
        });
    }

    handleAttch(message_id , i = undefined){
        let id = this.id;
        let api = this.api;
        
        return new Promise(function(resolve, reject){           
            api.get(id).vk().request('messages.getById', {'message_ids' : message_id}, function(body) {

                let attchs = [];
                let main = i !== undefined ? i : body.response.items[0];

                main.attachments.map((i,index) =>{
                    if(i.type === 'photo'){
                        let url ;
                        if(i.photo.photo_75 !== undefined) url = i.photo.photo_75;
                        if(i.photo.photo_130 !== undefined) url = i.photo.photo_130;
                        if(i.photo.photo_604 !== undefined) url = i.photo.photo_604;
                        if(i.photo.photo_807 !== undefined) url = i.photo.photo_807;
                        if(i.photo.photo_1280 !== undefined) url = i.photo.photo_1280;
                        attchs.push(url);
                        if(index == main.attachments.length-1) resolve({"photo":attchs});
                    }
                    else if(i.type === 'doc'){
                        let url = i.doc.url;
                        attchs.push(url);

                        if(index == main.attachments.length-1) resolve({"doc":attchs});
                    }
                    else if(i.type === 'link'){
                        let url = i.link.url;
                        attchs.push(url);
                        if(index == main.attachments.length-1) resolve({"link":attchs});
                    }

                    else if(i.type === 'gift'){
                        let url = i.gift.thumb_96;
                        attchs.push(url);
                        if(index == main.attachments.length-1) resolve({"photo":attchs});
                    }
                    else if(i.type === 'audio'){
                        let url = i.audio.url;
                        attchs.push(url);
                        if(index == main.attachments.length-1) resolve({"audio":attchs});
                    }
                    else {
                        if(index == main.attachments.length-1) resolve({"other":''});
                    }
                    
                })
                
            });
            });          
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
            console.log(body);
            if(body.response === undefined){
                tm.Send(api,id,`Невозможно установить связь с сервером.Возможно,вы отправили неверную ссылку из адресной строки.Повторите,пожалуйста, попытку`);
                
                return;
            }
            let key = body.response.key; 
            let server = body.response.server;
            let ts = body.response.ts; 
            LongPoll.runLP(key,server,ts,id,api);
        });
    }
}

module.exports = Message;