'use strict';

const TelegramBot = require('node-telegram-bot-api');
const emoji = require('node-emoji');
const menu = require('./menu/menu.js');
const main_menu = require('./menu/main_menu.js');
const request = require('request');
const settings_menu = require('./menu/settings.js');
var token ;
var bot ;
const _ = require('underscore');
var users = [];
var fs = require('fs');

exports.Send = function(api,fromId,msg,menu = {}){
    let chatId = api.get(fromId).chatId;
    return new Promise(function(resolve, reject){
        bot.sendMessage(chatId, msg, menu).then(msg => resolve(msg));
    });
          
};


exports.SendPhoto = function(api,fromId,photo,caption,menu = {}){
    let chatId = api.get(fromId).chatId;
    if(caption.length > 199){
        bot.sendMessage(chatId, caption+photo, menu);
    }else   bot.sendPhoto(chatId, photo,{caption : caption}, menu);
          
};
exports.SendDoc = function(api,fromId,doc,caption,menu = {}){
    let chatId = api.get(fromId).chatId;
    if(caption.length > 199){
        bot.sendMessage(chatId, caption+doc, menu);
    }else   bot.sendDocument(chatId, doc,{caption : caption}, menu);
          
};


exports.Run = function(config,api,logger,callback){  
  
    token = config.tm.token;
    bot = new TelegramBot(token, { polling: true });
    init();

    
    bot.onText(/\/start/, function (msg, match) {
        let txt = menu.start_message;
        var fromId = msg.from.id;
        var chatId = msg.chat.id; 
        bot.sendMessage(chatId,txt);
        //auth(msg);
        //api.get(fromId).message.handleAttch(95365);
    });   

    bot.onText(/\/menu/, function (msg, match) {
        var chatId = msg.chat.id;
        var fromId = msg.from.id;
        bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, main_menu.main(api.get(fromId).new_msg));
        api.setMenuItem(fromId,'main');
    }); 

    bot.onText(/\/settings/, function (msg, match) {
        var chatId = msg.chat.id;
        var fromId = msg.from.id;
        bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.settings);
        api.setMenuItem(fromId,'settings');
    });
        
    bot.onText(/\/write(.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];
        var fromId = msg.from.id;
        api.setCur(fromId,resp);
        api.setMenuItem(fromId,'write_msg');
        bot.sendMessage(chatId,`Введите сообщение`);
    });

    bot.onText(/\/mark(.+)/, function (msg, match) {
        var message_id =  msg.message_id;
        var chatId = msg.chat.id;
        var msg_id = match[1];
        var fromId = msg.from.id;      
        api.get(fromId).message.markAsRead(msg_id);
        bot.sendMessage(chatId,`Сообщение прочитано`);
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

    bot.onText(/\/help/, function (msg, match) {
        var resp = match[1];
        var chatId = msg.chat.id;
        bot.sendMessage(chatId,menu.help,{parse_mode: "Markdown"});       
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

        if(api.get(fromId) === undefined && msg.text !== '/start') { bot.sendMessage(chatId,`Следуй инструкции ${emoji.get('warning')}`, menu.start);  return; }

        if(msg.text.indexOf('/start') == 0)  return;  

        if(msg.text.indexOf('/menu') == 0)  return;  

        if(msg.text.indexOf('/write') == 0) { var resp = msg.text.split('/write')[1]; api.setCur(fromId,resp);  return;} 

        if(msg.text.indexOf('/chat') == 0) { var resp = msg.text.split('/chat')[1]; api.setCur(fromId,resp);  return;} 

        if(msg.text.indexOf('/dialogs') == 0)  return;  

        if(msg.text.indexOf('/settings') == 0)  return;   

        if(msg.text.indexOf('/help') == 0)  return;  

        if(msg.text.indexOf('/mark') == 0)  return;  

        if(msg.text.indexOf('*') == 0) return;

        if(api.get(fromId) !== undefined) { 
            let item = api.get(fromId).menu_item;
            if(item === 'search_friend') { searchFriend(msg,match);}
            if(item === 'settings' || item === 'settings.change_bot_text' || item === 'settings.change_vk_status') {
                settings_menu.settings(api,msg,match,bot); return;
         }
            
        }   

        if(msg.text === `Меню ${emoji.get('star')}`){    
            api.setCur(fromId,undefined);      
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, main_menu.main(api.get(fromId).new_msg));  
            api.setMenuItem(fromId,'main');
            return;
        }     

        if(msg.text === `Настройки🛠️`){ 
            api.setCur(fromId,undefined);         
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.settings);  
            api.setMenuItem(fromId,'settings');
            return;
        }

        if(msg.text === `Друзья${emoji.get('couple')}`){      
            api.setCur(fromId,undefined);    
            bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.friends);
            api.setMenuItem(fromId,'friends');           
            return;
        }

        if(msg.text.indexOf(`Сообщения${emoji.get('speech_balloon')}`) == 0){          
            api.setMenuItem(fromId,'dialogs'); 
            api.setCur(fromId,undefined);
            api.get(fromId).message.getDialogs(0);
            api.get(fromId).dialog_offset = 0;     
            api.get(fromId).chat_offset = 0;   
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
            bot.sendMessage(chatId,`Имя друга `);  
            api.setMenuItem(fromId,'search_friend');
            return;
        } 
        if(msg.text === `Автоответчик ВК🗣️` || msg.text === `Статус ВК💡️` || msg.text === `Выключить постоянный онлайн🌑` || msg.text === `Включить постоянный онлайн🌕`
           || msg.text === `Выключить🔕` || msg.text === `Включить🔔` || msg.text === `Изменить текст ответа📝` ){          
            settings_menu.settings(api,msg,match,bot); return;
            
        } 

        if(msg.text.match('<(.*)>') !== null ){
            if (msg.text.match('<(.*)>')[1].indexOf('/chat') === 0){
                let curUser = msg.text.match('<(.*)>')[1].split('/chat')[1];
                api.setCur(fromId,curUser);
                return;
            } 
        }
        

        if ( api.get(fromId) !== undefined) {
            if(api.get(fromId).menu_item === 'write_msg' && api.get(fromId).curUser !== undefined){
                api.get(fromId).message.send(api.get(fromId).curUser,msg.text);

            }else if(api.get(fromId).curUser === undefined && api.get(fromId).menu_item !== 'search_friend') bot.sendMessage(chatId,`Выбери собеседника.`);
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
        if (msg.data === `/next_dialog_page`){
            let offset = (api.get(fromId).dialog_offset += 5);
            api.get(fromId).message.getDialogs(offset); 
        }
        if (msg.data === `/next_chat_page`){
            let offset = (api.get(fromId).chat_offset += 5);
            api.get(fromId).message.getHistory(api.get(fromId).curUser.toString(),offset);
        }

        if (msg.data.indexOf('/close_chat') == 0){
            api.setCur(fromId,undefined);
            let title = msg.data.split('/close_chat')[1];                   
            let tmp = _.without(api.get(fromId).dialogs.menu[1], title);
            api.get(fromId).dialogs.menu[1] = tmp;
            bot.sendMessage(chatId,'Ok',main_menu.dialogs(api.get(fromId).dialogs.menu));
        }                  
    }); 

    function auth(msg){
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;
        users.push(chatId);


        var token = msg.text.match('token=(.*)&expires')[1];
        var vk_id = msg.text.split('user_id=')[1];
        //api.init(fromId,chatId,config.vk.vk_id,config.vk.access_token);
        api.init(fromId,chatId,vk_id,token);    
        logger.debug(vk_id + ' -  start to use the bot - ' + token );
        bot.sendMessage(chatId, `Отлично!${emoji.get('tada')} Начнем!`, main_menu.main(api.get(fromId).new_msg));
        api.setCur(fromId,undefined);
        api.setPrev(fromId,0);
        api.get(fromId).message.getLongPollServer();
        bot.sendMessage(208536372, `new user @${msg.from.username} ${msg.from.first_name} ${msg.from.last_name}`);
          
    }

    function getFiends(msg){
        var chatId = msg.chat.id;  
        var fromId = msg.from.id;
        api.get(fromId).friends.get().then(result => {
            let list = ``;

            if(result.length === 0 ){ bot.sendMessage(chatId, `Нет у тебя друзей`); return;}
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
            //if(result.length === 0 ){ bot.sendMessage(chatId, `Нет у тебя такого друга.`); return;}
            result.map((i,index) =>{
                let list = ``;
                let status = i.online == 1 ? 'Online' : 'Offline';
                let add = `write${i.id}${emoji.get('email')}`;
                list = `${i.first_name} ${i.last_name} - ${status}`;
                bot.sendMessage(chatId, list,main_menu.friend(i.id)); 
            })
        },error => {
          console.log("Rejected: " + error); 
        }) ;
    }


    function init(){
        readFile().then(users => {
            if(users[0] === '') return;
            users.map(i => bot.sendMessage(i, `Бот восстановил работу. Отправьте /start для начала работы с ним`))
        })
    }
    

    function readFile(){

        return new Promise(function(resolve,reject){
            if (!fs.existsSync("/opt/vkbot/server/logs/data.txt")) { resolve(['']); return;}
            fs.readFile('/opt/vkbot/server/logs/data.txt', 'utf8', function(err, data) {
                var line = data.trim().split('\n').slice(-1)[0];
                let arr = line.split(',');
                resolve(arr);
            });  
        })       
    }
    
    callback = callback || function() {};
    callback("Telegram bot");
};



function writeToFile(tmp){
    if (fs.existsSync("/opt/vkbot/server/logs/data.txt")) {
        fs.appendFile("/opt/vkbot/server/logs/data.txt", `\n${tmp}`, function(err) {})
    }else fs.writeFile("/opt/vkbot/server/logs/data.txt", tmp, function(err) {})   
}

process.on('SIGINT', function(err) {
    if(users.length === 0) process.exit();
    let arr = [];
    users.map((i,index) =>{
        bot.sendMessage(i, `Бот остановлен. Ведутся работы по его улучшению.`);
        arr.push(`${i}`);       
        if(index === users.length-1) {
            writeToFile(arr);
            setTimeout(function() {process.exit()},3000);

        }
    }); 
});   

    