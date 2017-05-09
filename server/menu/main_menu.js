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

function dialogs(arr){
  let main = {
        reply_markup : {
          resize_keyboard: true,
          one_time_keyboard: false,
          keyboard: arr
        }
  }
  return main;
}

function msg(user_id,msg_id){
	let message = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: `Ответить ${emoji.get('email')}`, callback_data: `/write${user_id}` }],
              [{ text: `Прочитано ${emoji.get('incoming_envelope')}`, callback_data: `/mark_as_read${msg_id}` }],
              [{ text: `Скрыть ${emoji.get('no_entry_sign')}`, callback_data: `/close_not` }]
            ]
        })
    };
	return message;
}  	

function friend(user_id){
	let message = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: `Написать ${emoji.get('email')}`, callback_data: `/write${user_id}` }],
              [{ text: `Скрыть ${emoji.get('no_entry_sign')}`, callback_data: `/close_not` }]
            ]
        })
    };
	return message;
} 

function next_dialog_page(){
  let message = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: `Далее ➡️`, callback_data: `/next_dialog_page` }]              
            ]
        })
    };
  return message;
} 

function next_chat_page(title){
  let message = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: `Далее ➡️`, callback_data: `/next_chat_page` }],
              [{ text: `Закрыть ✖️`, callback_data: `/close_chat${title}` }]              
            ]
        })
    };
  return message;
} 

module.exports.main = main;
module.exports.dialogs = dialogs;
module.exports.msg = msg;
module.exports.friend = friend;
module.exports.next_dialog_page = next_dialog_page;
module.exports.next_chat_page = next_chat_page;