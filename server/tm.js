'use strict';

const TelegramBot = require('node-telegram-bot-api');
const emoji = require('node-emoji');
const menu = require('./menu/menu.js');
const main_menu = require('./menu/main_menu.js');
const request = require('request');
const settings_menu = require('./menu/settings.js');
var token ;
var bot ;



exports.Send = function(api,fromId,msg,menu = {}){
    let chatId = api.get(fromId).chatId;
    return new Promise(function(resolve, reject){
        bot.sendMessage(chatId, msg, menu).then(msg => resolve(msg));
    });
          
};

exports.SendPhoto = function(api,fromId,photo,caption,menu = {}){
    let chatId = api.get(fromId).chatId;
    bot.sendPhoto(chatId, photo,{caption : caption}, menu);
          
};
exports.SendDoc = function(api,fromId,doc,caption,menu = {}){
    let chatId = api.get(fromId).chatId;
    bot.sendDocument(chatId, doc,{caption : caption}, menu);
          
};


exports.Run = function(config,api,logger,callback){  
  
    token = config.tm.token;
    bot = new TelegramBot(token, { polling: true });
    
    
    bot.onText(/\/start/, function (msg, match) {
        let txt = menu.start_message;
        var fromId = msg.from.id;
        var chatId = msg.chat.id; 
        auth(msg);
        //api.get(fromId).message.handleAttch(95365);
        //bot.sendMessage(chatId, txt,menu.start);
    });              
        
    bot.onText(/\/settings/, function (msg, match) {
        var chatId = msg.chat.id;
        bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.settings);
        api.setMenuItem(fromId,'settings');
    });
        
    bot.onText(/\/write(.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];
        var fromId = msg.from.id;
        api.setCur(fromId,resp);
        api.setMenuItem(fromId,'write_msg');
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
        api.get(fromId).message.getDialogs(0);
        api.get(fromId).dialog_offset = 0;
    });   

    bot.onText(/\/chat(.+)/, function (msg, match) {
        var resp = match[1];
        var fromId = msg.from.id;
        api.get(fromId).chat_offset = 0;
        api.get(fromId).message.getHistory(resp,0);
        
    });    

    bot.on('message', function (msg,match) {
        
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;
        var message_id =  msg.message_id;
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

        if(msg.text.indexOf('/chat') == 0) { var resp = msg.text.split('/chat')[1]; api.setCur(fromId,resp);  return;} 

        if(msg.text.indexOf('/dialogs') == 0) {var resp = msg.text.split('/dialogs')[1]; api.setCur(fromId,resp);  return;}  

        if(msg.text.indexOf('*') == 0) return;

        if(api.get(fromId) !== undefined) { 
            let item = api.get(fromId).menu_item;
            if(item === 'search_friend') { searchFriend(msg,match); }
            if(item === 'settings' || item === 'settings.change_bot_text' || item === 'settings.change_vk_status') { settings_menu.settings(api,msg,match,bot); }
            
        }   

        if(msg.text === `Меню ${emoji.get('star')}`){          
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, main_menu.main(api.get(fromId).new_msg));  
            api.setMenuItem(fromId,'main');
            return;
        }     

        if(msg.text === `Настройки🛠️`){          
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.settings);  
            api.setMenuItem(fromId,'settings');
            return;
        }

        if(msg.text === `Друзья${emoji.get('couple')}`){          
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.friends);
            api.setMenuItem(fromId,'friends');           
            return;
        }

        if(msg.text.indexOf(`Сообщения${emoji.get('speech_balloon')}`) == 0){          
            api.setMenuItem(fromId,'dialogs'); 
            api.get(fromId).message.getDialogs(0);
            api.get(fromId).dialog_offset = 0;     
               
            return;
        }

        if(msg.text === `Прочитано ${emoji.get('incoming_envelope')}`){          
            api.get(fromId).message.markAsRead(api.get(fromId).lastMsg);
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, main_menu.main(api.get(fromId).new_msg));  
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

    bot.on('callback_query', function (msg,match) {
        var chatId = msg.message.chat.id; 
        var fromId = msg.from.id; 
        var message_id =  msg.message.message_id;
        if (msg.data.indexOf('/chat') == 0){
            var resp = msg.data.split('/chat')[1];
            let user_id = resp.split(';')[0];
            let msg_id = resp.split(';')[1];
            const opts = {
                chat_id: chatId,
                message_id: message_id,
                reply_markup:main_menu.msg(user_id,msg_id,message_id).reply_markup
            };

            bot.editMessageText(msg_text,opts); 
        }

        if (msg.data.indexOf('/write') == 0){
            api.setMenuItem(fromId,'write_msg');
            var user_id = msg.data.split('/write')[1];
            api.setCur(fromId,user_id);
            bot.editMessageText(`Введите сообщение`,{chat_id: chatId, message_id: message_id});
        }
        if (msg.data.indexOf('/mark_as_read') == 0){
            let msg_id = msg.data.split('/mark_as_read')[1];            
            api.get(fromId).message.markAsRead(msg_id);
            bot.editMessageText(`Сообщение прочитано`,{chat_id: chatId, message_id: message_id});
        }
        if (msg.data.indexOf('/close_not') == 0){
            var message_id =  msg.message.message_id;
            bot.editMessageText(`Ok`,{chat_id: chatId, message_id: message_id}); 
        }
        if (msg.data === `/nextDialogPage`){
            let offset = (api.get(fromId).dialog_offset += 5);
            api.get(fromId).message.getDialogs(offset); 
        }
        if (msg.data === `/nextChatPage`){
            let offset = (api.get(fromId).chat_offset += 5);
            api.get(fromId).message.getHistory(api.get(fromId).curUser.toString(),offset);
        }
        
    }); 

    function auth(msg){
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;

        //var token = msg.text.match('token=(.*)&expires')[1];
        //var vk_id = msg.text.split('user_id=')[1];
        api.init(fromId,chatId,config.vk.vk_id,config.vk.access_token);
        
        
        bot.sendMessage(chatId, `Отлично!${emoji.get('tada')} Начнем!`, main_menu.main(api.get(fromId).new_msg));
        api.setCur(fromId,0);
        api.setPrev(fromId,0);
        api.get(fromId).message.getLongPollServer();
       // api.init(fromId,chatId,vk_id,token);       
    }

    function getFiends(msg){
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;
        api.get(fromId).friends.get().then(result => {
            let list = ``;
            result.map((i,index) =>{
                let status = i.online == 1 ? 'Online' : 'Offline';
                let add = `write${i.id}${emoji.get('email')}`;
                list += `${i.first_name} ${i.last_name} - ${status}\n/${add} \n`;
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
            
            result.map((i,index) =>{
                let list = ``;
                let status = i.online == 1 ? 'Online' : 'Offline';
                let add = `write${i.id}${emoji.get('email')}`;
                list = `${i.first_name} ${i.last_name} - ${status}`;
               // if(index === result.length-1) {
                bot.sendMessage(chatId, list,main_menu.friend(i.id));   //}
            })
        },error => {
          console.log("Rejected: " + error); 
        }) ;
    }
  
    callback = callback || function() {};
    callback("Telegram bot");
};

    

    