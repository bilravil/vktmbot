'use strict';
const request = require('request');
const tm = require('./tm.js');


function runLP (key,server,ts,id,api) {
	const options = {  
	    url: `https://${server}?act=a_check&key=${key}&ts=${ts}&wait=25&mode=2&version=1`,
	    method: 'POST',
	    json : true		    
	};

	request(options, function(err, res, body) {  			    
	    if (err) { 
	        console.log(err);
	        tm.Send("Ошибка при работе с longPollServer"); 
	    }  
	    
	    ts = body.ts;
	    var updates = body.updates;
	    
	    if(updates.length !== 0){

	    	updates.map((i,index) => {	    		
	    		if(i[0] == 4){
	    			let prev = updates[index-1][0];
	    			if(prev == 7) {
	    				setTimeout(api.get(id).message.sendByBot(i[1],id,api),100000);
	    				api.get(id).message.sendToTm(i,id,api);
	    			}	    			
	    		}
	    	})
	    }
	    runLP(key,server,ts,id,api);
	    
	});	
}


module.exports.runLP = runLP;