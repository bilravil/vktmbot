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
	    if(body.failed !== undefined){
	    	console.log(body);
	    	let err_type = body.failed;
	    	if(err_type === 1){	    		
	    		ts = body.ts;
	    		polling(body,key,server,ts,id,api);
	    	}
	    	if(err_type === 2){
	    		getNewKey(id,api).then(result =>{
	    			key = result.key;
	    			polling(body,key,server,ts,id,api);
	    		})
	    		
	    	}
	    	if(err_type === 3){
	    		getNewKey(id,api).then(result =>{
	    			key = result.key;
	    			ts = result.ts;
	    			polling(body,key,server,ts,id,api);
	    		})    		
	    	}
	    }else polling(body,key,server,ts,id,api);
	    
	    																			
	    
	});	
}

function polling(body,key,server,ts,id,api){
	if(body.ts !== undefined) ts = body.ts;
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
	    
    runLP(key,server,ts,id,api);
}

function getNewKey(id,api){
	return new Promise(function(resolve, reject){
		api.get(id).vk().request('messages.getLongPollServer', { }, function(body) {
			let res = {};
            let key = body.response.key; 
            let server = body.response.server;
            let ts = body.response.ts; 
            res = {
            	key : key,
            	ts : ts
            }
            resolve(res);
        });
	})
}


module.exports.runLP = runLP;