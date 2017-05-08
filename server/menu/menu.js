const emoji = require('node-emoji');


const menu = {
    start : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Старт! ${emoji.get('dizzy')}`]]
      }
    },

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
        keyboard: [[`Друзья${emoji.get('couple')}`],[`Диалоги${emoji.get('speech_balloon')}`],[`Настройки🛠️`]]
      }
    },

    friends : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Список ${emoji.get('top')}`],[`Поиск${emoji.get('mag')}`],[`Меню ${emoji.get('star')}`]]
      }
    },

    settings : {
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [[`Автоответчик ВК🗣️`],[`Статус ВК💡️`],[`Меню ${emoji.get('star')}`]]
      }
    },

    next_dialog_page : {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: `Далее${emoji.get('arrow-right')}`, callback_data: `/nextDialogPage` }]              
            ]
        })
    },

    

    

    start_message : `Привет! Я бот для VK . Для начала  тебе  необходимо пройти по этой ссылке - https://vk.cc/6BdSa4 и дать доступ приложению. 
            Потом скопировать путь с адресной строки и отправить в этот  чат. 
            Данная процедура необходима для переадресации  сообщений в telegram и не несет никакой опасности для твоего аккаунта.`
}

module.exports = menu;
