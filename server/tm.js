'use strict';


const TelegramBot = require('node-telegram-bot-api');

const token = '364125274:AAHe8sq5NG5wdbwhRIMDWEoextKtVGoLBy4';
var bot = new TelegramBot(token, { polling: true });
const chatId = "208536372"; 



exports.Send = function(msg){
	if(typeof(msg) == 'object') {
		let tmp = `${msg[7].first_name} ${msg[7].last_name}(/id${msg[3]}) : ${msg[6]}`;
		bot.sendMessage(chatId, tmp);   
	}
	else bot.sendMessage(chatId, msg);    
};

exports.Run = function(api,callback){  
    bot.sendMessage(chatId, 'My VK assistant started.Please send /init to start.');  

    bot.onText(/\/chatId/, (msg) => {
      var chatId = msg.chat.id;
      bot.sendMessage(chatId, chatId);
    });

    bot.onText(/\/init/, function (msg, match) {
      var fromId = msg.from.id;
      api.init(fromId);
      api.setCur(fromId,0);
      api.setPrev(fromId,0);
      api.get(fromId).message.getLongPollServer(fromId,api);

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

    bot.onText(/\/friends/, function (msg, match) {
      var chatId = msg.chat.id;
      var fromId = msg.from.id;
      api.get(fromId).friends.get(26194851).then(result => {
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

    bot.onText(/\/#(.+)/, function (msg, match) {
      var chatId = msg.chat.id;
      var fromId = msg.from.id;
      var resp = match[1];
      api.get(fromId).friends.search(26194851,resp).then(result => {
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

    bot.on('message', function (msg) {
      var fromId = msg.from.id;
      if ( api.get(fromId) !== undefined) {
        if(api.get(fromId).curUser != 0 ){
          api.get(fromId).message.send(api.get(fromId).curUser,msg.text);
          api.setCur(fromId,0);
        }
      }    
    });
    
    callback = callback || function() {};
    callback("Telegram bot");
};

    

    