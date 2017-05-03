'use strict';
const request = require('request');
const Users = require('./users.js');
const LongPoll = require('./longpoll.js');
const tm = require('./tm.js');


class Message {

	// отпрваить новые сбщ в телеграм
	sendToTm(i,id,api) {
		let msg_id = i[1];
		let user_id = i[3];
		let date = i[4];
		let title = i[5];
		let text = i[6];
        if(title === " ... " &&  api.get(id).lastMsg !== msg_id){
        	Users.get(user_id).then(result => {
            	let user = {};
            	user.first_name = result.first_name;
            	user.last_name = result.last_name;
            	i[7] = user;
            	tm.Send(i);
            	api.setLastMsg(id,msg_id);  
            },error => {
            	console.log("Rejected: " + error); 
            }) 
        } 
	}
	// автоответчик для вк
	sendByBot(message_ids,id,api) {
		return function(){
			const options = {  
			    url: 'https://api.vk.com/method/messages.getById?v=5.52&access_token=1777f5e10cf5717eed8bd307c0c2f553f1d16f6ab7e54abb56c568bfdebca1e106be871b3b1dd683531c3',
			    method: 'POST',
			    json : true,
			    qs : { "message_ids" : message_ids }
			};
	        request(options, function (err, remoteResponse, remoteBody) {
	            if (err) { 
	                console.log(err);
	                tm.Send("Ошибка при получении данных о сбщ для  бота.");
	            }
	            remoteBody.response.items.map(i => {  	                
	                 	     
	                //var curTime = new Date().getTime() / 1000;
                	//var period = parseInt(curTime) - parseInt(i.date);              
	                if(i.title === " ... " && i.read_state === 0 && api.get(id).prevUser !== i.user_id){
	                    api.setPrev(id,i.user_id);  
	                    const options = {  
						    url: 'https://api.vk.com/method/messages.send?v=5.52&access_token=1777f5e10cf5717eed8bd307c0c2f553f1d16f6ab7e54abb56c568bfdebca1e106be871b3b1dd683531c3',
						    method: 'POST',
						    json : true,
						    qs : { "user_ids":i.user_id, "message" : "Ваше сообщение прочитано , Вам ответят позднее.С наилучшими пожеланиями, бот Иван."}
						};

						request(options, function(err, res, body) {  			    
						    if (err) { 
					            console.log(err);
					            tm.Send("Ошибка при отправке сбщ ботом."); 
					        }  
						});	                    
	                }                               
	            });	            
	        });
    	}
	}	

	send(user_id,msg) {
		const options = {  
		    url: 'https://api.vk.com/method/messages.send?v=5.52&access_token=1777f5e10cf5717eed8bd307c0c2f553f1d16f6ab7e54abb56c568bfdebca1e106be871b3b1dd683531c3',
		    method: 'POST',
		    json : true,
		    qs : { "user_ids":user_id, "message" : msg }
		};

		request(options, function(err, res, body) {  			    
		    if (err) { 
	            console.log(err);
	            tm.Send("Ошибка при отправке сбщ."); 
	        }  
		});
	}

	// запуск пулл сервера
	getLongPollServer(id,api){
		const options = {  
		    url: 'https://api.vk.com/method/messages.getLongPollServer?v=5.52&access_token=1777f5e10cf5717eed8bd307c0c2f553f1d16f6ab7e54abb56c568bfdebca1e106be871b3b1dd683531c3',
		    method: 'POST',
		    json : true		    
		};

		request(options, function(err, res, body) {  			    
		    if (err) { 
	            console.log(err);
	            tm.Send("Ошибка при отправке сбщ."); 
	        }
	        let key = body.response.key; 
	        let server = body.response.server;
	        let ts = body.response.ts; 
	        LongPoll.runLP(key,server,ts,id,api);
		});	
	}
}

module.exports = Message;