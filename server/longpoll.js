'use strict';
const request = require('request');
const tm = require('./tm.js');
const _ = require('underscore');

function runLP (key,server,ts,id,api) {                 
	const options = {  
	    url: `https://${server}?act=a_check&key=${key}&ts=${ts}&wait=25&mode=2&version=1`,
	    method: 'POST',
	    json : true		    
	};

	request(options, function(err, res, body) {  			    
	    if (err) { 
	        console.log(err);
	        tm.Send(api,id,"Ошибка при работе с longPollServer"); 
	    }  
	    ts = body.ts;
	    var updates = body.updates;
	    if(updates.length !== 0){
	    	updates.map((i,index) => {	    		
	    		if(i[0] == 4 && updates[index-1] !== undefined){
	    			let prev = updates[index-1][0];
	    			let type = i[5] === ' ... ' ? 'dialog' : 'chat';
	    			if(prev == 7) {
	    				if(type === 'dialog' && (api.get(id).vk_bot.state === true)){
    				 		setTimeout( api.get(id).message.sendByBot(i[1] , id,api), parseInt(api.get(id).vk_bot.timer));
	    				}
	    				if(type === 'dialog' && !_.isEmpty(i[7])) api.get(id).message.getById(i[1]);
	    				if(type === 'chat' && i[7].fwd !=undefined) api.get(id).message.getById(i[1]);
	    				if(type === 'dialog' && _.isEmpty(i[7])) api.get(id).message.sendToTm(i);
	    				if(type === 'chat' && i[7].fwd ==undefined) api.get(id).message.sendToTm(i);
	    				 
	    			}	    			
	    		}
	    	})
	    }
	    runLP(key,server,ts,id,api);
	    
	});	
}


module.exports.runLP = runLP;