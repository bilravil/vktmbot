const emoji = require('node-emoji');


const menu = {

    MENU : `Старт! ${emoji.get('dizzy')} Прочитано ${emoji.get('incoming_envelope')} Меню ${emoji.get('star')} Написать ${emoji.get('email')} 
    Друзья${emoji.get('couple')} Диалоги${emoji.get('speech_balloon')} Настройки🛠️ Автоответчик ВК🗣️ Статус ВК💡️ Далее${emoji.get('arrow-right')} 
    Поиск${emoji.get('mag')} Скрыть ${emoji.get('no_entry_sign')} Закрыть ✖️` ,

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

    

    

    start_message : `Привет! Я бот для VK . Для начала  тебе  необходимо пройти по этой ссылке - https://vk.cc/6Cfm3H и дать доступ приложению. 
            Потом скопировать путь с адресной строки и отправить в этот  чат. 
            Данная процедура необходима для переадресации  сообщений в telegram и не несет никакой опасности для твоего аккаунта.` ,

    help : `*Команды:*
        _settings_ - настройки
        _dialogs_ - сообщения
        _friends_ - список друзей
        _help_ - помощь
        `
}

module.exports = menu;
