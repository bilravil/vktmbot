const emoji = require('node-emoji');


const menu = {

    message : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Прочитано ${emoji.get('incoming_envelope')}`],[`Меню ${emoji.get('star')}`]]
      }
    },

    chat : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Написать ${emoji.get('email')}`],[`Меню ${emoji.get('star')}`]]
      }
    },

    main : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Друзья${emoji.get('couple')}`],[`Диалоги${emoji.get('speech_balloon')}`]]
      }
    },

    friends : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Список ${emoji.get('top')}`],[`Поиск${emoji.get('mag')}`],[`Меню ${emoji.get('star')}`]]
      }
    },

    write_msg : {
       parse_mode: 'markdown',
       disable_web_page_preview: false,
       reply_markup: JSON.stringify({
           inline_keyboard: [
              [ 
                {text: `Написать сбщ ${emoji.get('lower-left-ballpoint-pen')}`, callback_data:'write_msg'}
              ]
           ]
       })
    }
}

module.exports = menu;
