'use strict';

const TelegramBot = require('node-telegram-bot-api');
const emoji = require('node-emoji');
const menu = require('./menu/menu.js');

var token ;
var bot ;


exports.Send = function(api,fromId,msg){
  let chatId = api.get(fromId).chatId;
  

	if(typeof(msg) == 'object') {
		let tmp = `${msg[7].first_name} ${msg[7].last_name}(/id${msg[3]})  : \n${msg[6]} `; 
    bot.sendMessage(chatId, tmp,menu.message);
    api.setCur(fromId,msg[3]); 
	}
	else{
    bot.sendMessage(chatId, msg);    
  } 
};

exports.Run = function(config,api,callback){  
    
    token = config.tm.token;
    bot = new TelegramBot(token, { polling: true });

    bot.onText(/\/chatId/, (msg) => {
      var chatId = msg.chat.id;
      bot.sendMessage(chatId, chatId);
    });

    let dialogs = (chatId,fromId) =>{
      api.get(fromId).message.getDialogs()
        .then(result => {
            let user_ids = ``;           
            return new Promise(function(resolve, reject){ 
                result.map((i ,index ) => { 
                    user_ids += i.message.user_id + ',';  if(index == result.length-1) resolve(user_ids);
                });
            })
        .then(users_list => {             
            api.users().get(api,users_list).then(users => {   
                  result.map((k,index) =>{  
                    let i = k.message;
                    let user = {};
                    let list = ``;  
                    user.first_name = users[index].first_name;
                    user.last_name = users[index].last_name;
                    let title = i.title === ' ... ' ? `${user.first_name} ${user.last_name}` : i.title;
                    let chat = i.title === ' ... ' ? `chat${i.user_id} ${emoji.get('speech_balloon')}` : `chat0${i.chat_id} ${emoji.get('speech_balloon')}`;  
                    list = `${title} /${chat} \n${user.first_name} ${user.last_name} : ${i.body}\n`;
                    setTimeout(function(){bot.sendMessage(chatId, list)},index*200); 
                });
            })                    
        })          
      })
    }

    bot.onText(/\/start/, function (msg, match) {       

      var fromId = msg.from.id;
      var chatId = msg.chat.id; 
      bot.sendMessage(chatId, `Привет! Я бот для Вконтакте.`,menu.main);
      api.init(fromId,chatId);
      api.setCur(fromId,0);
      api.setPrev(fromId,0);
      api.get(fromId).message.getLongPollServer();
    });

    bot.on('callback_query', function (msg) {
        var chatId = msg.message.chat.id; 
        if (msg.data === 'make_as_read'){
            var fromId = msg.from.id;
            api.get(fromId).message.markAsRead(api.get(fromId).lastMsg);
            bot.sendMessage(chatId, "Ok");
        }
        if (msg.data === 'reply'){
          console.log('222');
        }
    }); 

    bot.onText(/\/id(.+)/, function (msg, match) {
      var fromId = msg.from.id;
      var resp = match[1];
      api.setCur(fromId,resp);  
    });

    bot.onText(/\/state/, function (msg, match) {
      var chatId = msg.chat.id;
      bot.sendMessage(chatId, "All right,boss!");     
    });

    bot.onText(/\/write(.+)/, function (msg, match) {
      var chatId = msg.chat.id;
      var resp = match[1];
      var fromId = msg.from.id;
      api.setCur(fromId,resp);
    });

    bot.onText(/\/friends/, function (msg, match) {
      var chatId = msg.chat.id;
      var fromId = msg.from.id;
      api.get(fromId).friends.get().then(result => {
          let list = ``;
          result.map((i,index) =>{
              let status = i.online == 1 ? 'Online' : 'Offline';
              list += `${i.first_name} ${i.last_name} (/id${i.id}) - ${status}\n`;
              if(index === result.length-1) {bot.sendMessage(chatId, list);   }
          })
        },error => {
          console.log("Rejected: " + error); 
        }) ;
      //bot.sendMessage(chatId, "All right,boss!");     
    });

    bot.onText(/\/dialogs/, function (msg, match) {
      var chatId = msg.chat.id;
      var fromId = msg.from.id;
      dialogs(chatId,fromId);
      //bot.sendMessage(chatId, "All right,boss!");     
    });

    bot.onText(/\/chat(.+)/, function (msg, match) {
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
            }).then(users_list => {           
                api.users().get(api,users_list).then(users => {  
                    let data = {};
                    return new Promise(function(resolve, reject){ 
                        users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);                   
                      });
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
    });

    bot.onText(/\*(.+)/, function (msg, match) {
      var chatId = msg.chat.id;
      var fromId = msg.from.id;
      var resp = match[1];
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
      //bot.sendMessage(chatId, "All right,boss!");     
    });

    


    bot.on('message', function (msg) {      
      var chatId = msg.chat.id;  
      var fromId = msg.from.id;

      if(msg.text.indexOf('/write') == 0) {var resp = msg.text.split('/write')[1]; api.setCur(fromId,resp);  return;} 

      if(msg.text.indexOf('/chat') == 0) {var resp = msg.text.split('/chat')[1]; api.setCur(fromId,resp);  return;} 

      if(msg.text.indexOf('/id') == 0) {var resp = msg.text.split('/id')[1]; api.setCur(fromId,resp);  return;} 

      if(msg.text.indexOf('*') == 0) return;

      if(msg.text === `Меню ${emoji.get('star')}`){          
          bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.main);  
          return;
      }

      if(msg.text === `Друзья${emoji.get('couple')}`){          
          bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.friends);           
          return;
      }

      if(msg.text === `Диалоги${emoji.get('speech_balloon')}`){          
          dialogs(chatId,fromId);           
          return;
      }

      if(msg.text === `Прочитано ${emoji.get('incoming_envelope')}`){          
          api.get(fromId).message.markAsRead(api.get(fromId).lastMsg);
          bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, menu.main);  
          return;
      }

      if(msg.text === `Написать ${emoji.get('email')}`){             
          return;
      }
      
      

      if(msg.text === `Список ${emoji.get('top')}`){          
          api.get(fromId).friends.get().then(result => {
            let list = ``;
            result.map((i,index) =>{
                let status = i.online == 1 ? 'Online' : 'Offline';
                let add = `write${i.id}${emoji.get('email')}`;
                list += `${i.first_name} ${i.last_name} - ${status} -  /${add} \n`;
                if(index === result.length-1) { bot.sendMessage(chatId, list);   }
            })
          },error => {
            console.log("Rejected: " + error); 
          });  
          return;
      }

      if(msg.text === `Поиск${emoji.get('mag')}`){          
          api.get(fromId).message.markAsRead(api.get(fromId).lastMsg);
          bot.sendMessage(chatId,`*Имя друга `);  
          return;
      }

      if ( api.get(fromId) !== undefined) {
        if(api.get(fromId).curUser != 0 ){
          api.get(fromId).message.send(api.get(fromId).curUser,msg.text);
          //api.setCur(fromId,0);
        }
      }    
    });
    
    callback = callback || function() {};
    callback("Telegram bot");
};

    

    