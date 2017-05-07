const emoji = require('node-emoji');


function main(count){
	let value = count === 0 ? '' : count;
	let main = {
      	reply_markup : {
	        resize_keyboard: true,
	        one_time_keyboard: false,
	        keyboard: [
		        [`Друзья${emoji.get('couple')}`],
		        [`Сообщения${emoji.get('speech_balloon')} ${value}`],
		        [`Настройки🛠️`]]
      	}
	}
	return main;
}

function msg(user_id,msg_id,message_id){
	let message = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: `Ответить ${emoji.get('email')}`, callback_data: `/write${user_id}` }],
              [{ text: `Прочитано ${emoji.get('incoming_envelope')}`, callback_data: `/mark_as_read${msg_id}` }],
              [{ text: `Скрыть ${emoji.get('no_entry_sign')}`, callback_data: `/close_not${message_id}` }]
            ]
        })
    };
	return message;
}  	


module.exports.main = main;
module.exports.msg = msg;