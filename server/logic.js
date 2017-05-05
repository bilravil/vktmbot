// 'use strict';
// const request = require('request');
// const tm = require('./tm.js');
// const menu = require('./menu/menu.js');

// class Logic {

// 	auth(msg){
//         var chatId = msg.chat.id;  
//         var fromId = msg.from.id;

//         var token = msg.text.match('token=(.*)&expires')[1];
//         var vk_id = msg.text.split('user_id=')[1];
//         tm.Send()
//         bot.sendMessage(chatId, `Отлично!${emoji.get('tada')} Начнем!`, menu.main);
//         api.init(fromId,chatId,vk_id,token);
//         api.setCur(fromId,0);
//         api.setPrev(fromId,0);
//         api.get(fromId).message.getLongPollServer();
//     }

//     getFiends(msg){
//         var chatId = msg.chat.id;  
//         var fromId = msg.from.id;
//         api.get(fromId).friends.get().then(result => {
//             let list = ``;
//             result.map((i,index) =>{
//                 let status = i.online == 1 ? 'Online' : 'Offline';
//                 let add = `write${i.id}${emoji.get('email')}`;
//                 list += `${i.first_name} ${i.last_name} - ${status} -  /${add} \n`;
//                 if(index === result.length-1) { bot.sendMessage(chatId, list);   }
//             })
//           },error => {
//             console.log("Rejected: " + error); 
//         });  
//     }

//     searchFriend(msg,match){
//         var chatId = msg.chat.id;
//         var fromId = msg.from.id;
//         var resp = match[1];
//         api.get(fromId).friends.search(resp).then(result => {
//             let list = ``;
//             result.map((i,index) =>{
//               let status = i.online == 1 ? 'Online' : 'Offline';
//               let add = `write${i.id}${emoji.get('email')}`;
//               list += `${i.first_name} ${i.last_name} - ${status} -  /${add} \n`;
//               if(index === result.length-1) {bot.sendMessage(chatId, list);   }
//             })
//           },error => {
//             console.log("Rejected: " + error); 
//         }) ;
//     }

//     dialogs (chatId,fromId) {
//       api.get(fromId).message.getDialogs()
//         .then(result => {
//             let user_ids = ``;           
//             return new Promise(function(resolve, reject){ 
//                 result.map((i ,index ) => { 
//                     user_ids += i.message.user_id + ',';  if(index == result.length-1){ user_ids += api.get(fromId).vk_id; resolve(user_ids);} 
//                 });
//         })
//         .then(users_list => {     
//             api.users().get(api,fromId,users_list).then(users => {  
//                 let data = {};
//                 return new Promise(function(resolve, reject){ 
//                     users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);                   
//                   });
//                 })
//         })
//         .then(user => {    
//             result.map((k,index) =>{  
//               let i = k.message;
//               let list = ``;  
//               let m = i.out === 0 ? i.user_id : api.get(fromId).vk_id; 
//               let title = i.title === ' ... ' ? `${user[i.user_id].first_name} ${user[i.user_id].last_name}` : i.title;
//               let chat = i.title === ' ... ' ? `chat${i.user_id} ${emoji.get('speech_balloon')}` : `chat0${i.chat_id} ${emoji.get('speech_balloon')}`;  
//               list = `${title} /${chat} \n${user[m].first_name} : ${i.body}\n`;
//               setTimeout(function(){bot.sendMessage(chatId, list)},index*200); 
//           });   
//         });                             
//         })          
//       }),error => { console.log("Rejected: " + error);  }
//     }  

//     chat (msg,match){
//       var chatId = msg.chat.id;
//       var fromId = msg.from.id;
//       var resp = match[1];
//       var peer_id = resp.charAt(0) === '0' ? 2000000000 + parseInt(resp) : parseInt(resp);
//       var flag = resp.charAt(0) === '0' ? true : false;
//       api.setCur(fromId,peer_id);
//       api.get(fromId).message.getHistory(peer_id)
//         .then(result => {
//             let user_ids = ``;           
//             return new Promise(function(resolve, reject){ 
//                 result.map((i ,index ) => { 
//                     user_ids += i.from_id + ',';  if(index == result.length-1) resolve(user_ids);
//                 });
//             }).then(users_list => {           
//                 api.users().get(api,fromId,users_list).then(users => {  
//                     let data = {};
//                     return new Promise(function(resolve, reject){ 
//                         users.map((i,index) =>{ data[i.id] = { first_name : i.first_name , last_name : i.last_name }; if(index == users.length-1) resolve(data);                   
//                       });
//                     })
//               .then(user => {
//                     result = result.reverse();
//                     result.map((i,index) =>{     
//                       let list = ``;                     
//                       var time = new Date(Date.UTC(1970, 0, 1)); 
//                       time.setSeconds(i.date);                    
//                       var date = time.getHours() + ":" + time.getMinutes();
//                       list = `${user[i.from_id].first_name} ${user[i.from_id].last_name} ${date} \n ${i.body}\n`; 
//                       setTimeout(function(){bot.sendMessage(chatId, list,menu.chat)},index*200);
//                     });
//                 })
                    
//                 });
//               })
//           },error => { console.log("Rejected: " + error);  });  
//     }
// }

// module.exports = Logic;