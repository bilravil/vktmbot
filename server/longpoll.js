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
	        runLP(key,server,ts,id,api);
	    }  
	    ts = body.ts;
	    var updates = body.updates;
	    if(updates !== undefined && updates !== null){
	    	
	    	if(updates.length !== 0){
		    	updates.map((i,index) => {	    			    		
		    		if(i[0] == 4 && updates[index-1] !== undefined){
		    			let prev = updates[index-1][0];
		    			if(prev == 7) {    				
		    				api.get(id).message.handleMessage(i);	    				 
		    			}	    			
		    		}
		    		if(i[0] == 80){
		    			api.get(id).new_msg = i[1];	    			
		    		}
		    	})
	    	}
	    }
	    let date = new Date().getHours() + ':' + new Date().getMinutes();
	    console.log(date + ' - '+ts);
	    runLP(key,server,ts,id,api);
	    
	});	
}


module.exports.runLP = runLP;