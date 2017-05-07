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
	    			if(prev == 7) {    				
	    				api.get(id).message.handleMessage(i);	    				 
	    			}	    			
	    		}
	    	})
	    }
	    runLP(key,server,ts,id,api);
	    
	});	
}


module.exports.runLP = runLP;