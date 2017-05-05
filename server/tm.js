'use strict';

const TelegramBot = require('node-telegram-bot-api');
const emoji = require('node-emoji');
const menu = require('./menu/menu.js');
const request = require('request');
var token ;
var bot ;


exports.Send = function(api,fromId,msg,menu = {}){
    let chatId = api.get(fromId).chatId;
    bot.sendMessage(chatId, msg, menu);    
    
};

exports.Run = function(config,api,callback){  
  
    token = config.tm.token;
    bot = new TelegramBot(token, { polling: true });
    
    
    bot.onText(/\/start/, function (msg, match) {
        let txt = menu.start_message;
        var fromId = msg.from.id;
        var chatId = msg.chat.id; 
        auth(msg);
        api.get(fromId).message.getById(95102);
        //bot.sendMessage(chatId, txt,menu.start);
    });              
        
    bot.onText(/\/write(.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];
        var fromId = msg.from.id;
        api.setCur(fromId,resp);
    });

    bot.onText(/\/friends/, function (msg, match) {
        getFiends(msg);    
    });

    bot.onText(/\*(.+)/, function (msg, match) {
        searchFriend(msg,match);
    }); 

    bot.onText(/\/dialogs/, function (msg, match) {
        var chatId = msg.chat.id;
        var fromId = msg.from.id;
        dialogs(chatId,fromId);   
    });   

    bot.onText(/\/chat(.+)/, function (msg, match) {
        chat(msg,match);
    });    

    bot.on('message', function (msg,match) {
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;

    
        if(msg.text.match('https://oauth.vk.com/blank.html#access_token=')) {
            auth(msg);
            return;
        } 

        if(msg.text === `Старт! ${emoji.get('dizzy')}`){          
            bot.sendMessage(chatId, menu.start_message, menu.start);  
            return;
        }

        if(api.get(fromId) === undefined) { bot.sendMessage(chatId,`Следуй инструкции ${emoji.get('warning')}`, menu.start);   }

        if(msg.text.indexOf('/write') == 0) {var resp = msg.text.split('/write')[1]; api.setCur(fromId,resp);  return;} 

        if(msg.text.indexOf('/chat') == 0) {var resp = msg.text.split('/chat')[1]; api.setCur(fromId,resp);  return;} 

        if(msg.text.indexOf('/dialogs') == 0) {var resp = msg.text.split('/dialogs')[1]; api.setCur(fromId,resp);  return;}  

        if(msg.text.indexOf('*') == 0) return;

        if(api.get(fromId) !== undefined) { 
            if(api.get(fromId).menu_item === 'search_friend') { searchFriend(msg,match); }
            if(api.get(fromId).menu_item === 'settings.change_bot_text') { 
                api.get(fromId).vk_bot.text = msg.text; 
                bot.sendMessage(chatId,`Текст автоответчика изменен${emoji.get('ok_hand')}`, menu.settings); 
                api.setMenuItem(fromId,'settings');      
            }
        }   

        if(msg.text === `Меню ${emoji.get('star')}`){          
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.main);  
            api.setMenuItem(fromId,'main');
            return;
        }
        

        if(msg.text === `Настройки🛠️`){          
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.settings);  
            api.setMenuItem(fromId,'settings');
            return;
        }

        if(msg.text === `Автоответчик ВК🗣️`){    
            let txt = api.get(fromId).vk_bot.state ? 'Выключить🔕' :'Включить🔔';
            let state = api.get(fromId).vk_bot.state ? 'Включен' :'Выключен';
            var vk_bot_settings = {
                reply_markup : {
                    resize_keyboard : true,
                    one_time_keyboard : false,
                    keyboard : [[txt],['Изменить текст ответа📝'],[`Меню ${emoji.get('star')}`]]
                }
            };  
            let msg = `📳Статус : ${state} \n\n📋Текст ответа : ${api.get(fromId).vk_bot.text} \n\n⏰Таймер : 150сек.`; 
            bot.sendMessage(chatId,msg, vk_bot_settings);  
            api.setMenuItem(fromId,'settings');
            return;
        }

        if(msg.text === `Выключить🔕`){      
            api.get(fromId).vk_bot.state = false;
            bot.sendMessage(chatId,`Автоответчик выключен${emoji.get('ok_hand')}`, menu.settings);
            api.setMenuItem(fromId,'settings');           
            return;
        }

        if(msg.text === `Включить🔔`){    
            api.get(fromId).vk_bot.state = true;      
            bot.sendMessage(chatId,`Автоответчик включен${emoji.get('ok_hand')}`, menu.settings);
            api.setMenuItem(fromId,'settings');           
            return;
        }

        if(msg.text === `Изменить текст ответа📝`){          
            bot.sendMessage(chatId,`Введи новый текст ответа📝`, menu.settings);
            api.setMenuItem(fromId,'settings.change_bot_text');           
            return;
        }

        if(msg.text === `Друзья${emoji.get('couple')}`){          
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.friends);
            api.setMenuItem(fromId,'friends');           
            return;
        }

        if(msg.text === `Диалоги${emoji.get('speech_balloon')}`){          
            dialogs(chatId,fromId);       
            api.setMenuItem(fromId,'dialogs');    
            return;
        }

        if(msg.text === `Прочитано ${emoji.get('incoming_envelope')}`){          
            api.get(fromId).message.markAsRead(api.get(fromId).lastMsg);
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.main);  
            return;
        }

        if(msg.text === `Написать ${emoji.get('email')}`){     
            api.setMenuItem(fromId,'write_msg');        
            return;
        }

        if(msg.text === `Список ${emoji.get('top')}`){          
            getFiends(msg);
            api.setMenuItem(fromId,'friend_list');
            return;
        }

        if(msg.text === `Поиск${emoji.get('mag')}`){          
            api.get(fromId).message.markAsRead(api.get(fromId).lastMsg);
            bot.sendMessage(chatId,`Имя друга `);  
            api.setMenuItem(fromId,'search_friend');
            return;
        }


        if ( api.get(fromId) !== undefined) {
            if(api.get(fromId).menu_item === 'write_msg'){
                api.get(fromId).message.send(api.get(fromId).curUser,msg.text);
            }
        }    
    });

    bot.on('callback_query', function (msg) {
        var chatId = msg.message.chat.id; 
        if (msg.data === 'make_as_read'){
        }
        if (msg.data === 'reply'){
        }
    }); 

    function auth(msg){
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;

        //var token = msg.text.match('token=(.*)&expires')[1];
        //var vk_id = msg.text.split('user_id=')[1];

        bot.sendMessage(chatId, `Отлично!${emoji.get('tada')} Начнем!`, menu.main);
       // api.init(fromId,chatId,vk_id,token);
        api.init(fromId,chatId,config.vk.vk_id,config.vk.access_token);
        api.setCur(fromId,0);
        api.setPrev(fromId,0);
        api.get(fromId).message.getLongPollServer();
    }

    function getFiends(msg){
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;
        api.get(fromId).friends.get().then(result => {
            let list = ``;
            result.map((i,index) =>{
                let status = i.online == 1 ? 'Online' : 'Offline';
                let add = `write${i.id}${emoji.get('email')}`;
                list += `${i.first_name} ${i.last_name} - ${status} -  /${add} \n`;
                if(index === result.length-1) {list += `${emoji.get('warning')} Нажми напротив имени друга,чтобы ему написать ${emoji.get('warning')}`; bot.sendMessage(chatId, list);   }
            })
        },error => {
            console.log("Rejected: " + error); 
        });  
    }

    function searchFriend(msg,match){
        var chatId = msg.chat.id;
        var fromId = msg.from.id;
        var resp = match === undefined ? msg.text : match[1];
        api.get(fromId).friends.search(resp).then(result => {
            let list = ``;
            result.map((i,index) =>{
                let status = i.online == 1 ? 'Online' : 'Offline';
                let add = `write${i.id}${emoji.get('email')}`;
                list += `${i.first_name} ${i.last_name} - ${status} -  /${add} \n`;
                if(index === result.length-1) {bot.sendMessage(chatId, list);   }
            })
        },error => {
          console.log("Rejected: " + error); 
        }) ;
    }

    function dialogs (chatId,fromId) {
        api.get(fromId).message.getDialogs()
            .then(result => {
                let user_ids = ``;           
                return new Promise(function(resolve, reject){ 
                    result.map((i ,index ) => { 
                        user_ids += i.message.user_id + ',';  if(index == result.length-1){ user_ids += api.get(fromId).vk_id; resolve(user_ids);} 
                    });
                })
            .then(users_list => {     
                api.users().get(api,fromId,users_list).then(users => {  
                    let data = {};
                    return new Promise(function(resolve, reject){ 
                        users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);});
                    })
            })
            .then(user => {    
                result.map((k,index) =>{  
                    let i = k.message;
                    let list = ``;  
                    let m = i.out === 0 ? i.user_id : api.get(fromId).vk_id; 
                    let title = i.title === ' ... ' ? `${user[i.user_id].first_name} ${user[i.user_id].last_name}` : i.title;
                    let chat = i.title === ' ... ' ? `chat${i.user_id} ${emoji.get('speech_balloon')}` : `chat0${i.chat_id} ${emoji.get('speech_balloon')}`;  
                    list = `${title} /${chat} \n${user[m].first_name} : ${i.body}\n`;
                    setTimeout(function(){bot.sendMessage(chatId, list)},index*200); 
                });   
            });                             
            })          
            }),error => { console.log("Rejected: " + error);  }
    }  

    function chat (msg,match){
        var chatId = msg.chat.id;
        var fromId = msg.from.id;
        var resp = match[1];
        var peer_id = resp.charAt(0) === '0' ? 2000000000 + parseInt(resp) : parseInt(resp);
        var flag = resp.charAt(0) === '0' ? true : false;
        api.setCur(fromId,peer_id);
        api.get(fromId).message.getHistory(peer_id)
            .then(result => {
                let user_ids = ``;           
                return new Promise(function(resolve, reject){ 
                    result.map((i ,index ) => { 
                        user_ids += i.from_id + ',';  if(index == result.length-1) resolve(user_ids);
                    }); 
                })
            .then(users_list => {           
                api.users().get(api,fromId,users_list).then(users => {  
                    let data = {};
                    return new Promise(function(resolve, reject){ 
                        users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);});
                    })
            .then(user => {
                result = result.reverse();
                result.map((i,index) =>{     
                    let list = ``;                     
                    var time = new Date(Date.UTC(1970, 0, 1)); 
                    time.setSeconds(i.date);                    
                    var date = time.getHours() + ":" + time.getMinutes();
                    list = `${user[i.from_id].first_name} ${user[i.from_id].last_name} ${date} \n ${i.body}\n`; 
                    setTimeout(function(){bot.sendMessage(chatId, list,menu.chat)},index*200);
                });
            })                     
            });
            })
            },error => { console.log("Rejected: " + error);  });  
    }
  
    callback = callback || function() {};
    callback("Telegram bot");
};

    

    