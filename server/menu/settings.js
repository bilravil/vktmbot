'use strict';
const request = require('request');
const _ = require('underscore');
const emoji = require('node-emoji');
const menu = require('./menu.js');
const main_menu = require('./main_menu.js');

function settings (api,msg,match,bot) {    
	var chatId = msg.chat.id;  
    var fromId = msg.from.id;

    if(msg.text === `Меню ${emoji.get('star')}`){    
        api.setCur(fromId,undefined);      
        bot.sendMessage(chatId,`${emoji.get('ok_hand')}`, main_menu.main(api.get(fromId).new_msg));  
        api.setMenuItem(fromId,'main');
        return;
    }   

	if(api.get(fromId).menu_item === 'settings.change_bot_text' ) { 
        api.get(fromId).vk_bot.text = msg.text; 
        bot.sendMessage(chatId,`Текст автоответчика изменен${emoji.get('ok_hand')}`, menu.settings); 
        api.setMenuItem(fromId,'settings');      
    }    

	if(msg.text === `Автоответчик ВК🗣️`){    
        let txt = api.get(fromId).vk_bot.state ? 'Выключить🔕' :'Включить🔔';
        let state = api.get(fromId).vk_bot.state ? 'Включен' :'Выключен';
        var vk_bot_settings = {
            reply_markup : {
                resize_keyboard : true,
                one_time_keyboard : false,
                keyboard : [[txt],['Изменить текст ответа📝'],[`Меню ${emoji.get('star')}`]]
            }
        };  
        let msg = `📳Статус : ${state} \n\n📋Текст ответа : ${api.get(fromId).vk_bot.text} \n\n⏰Таймер : 150сек.`; 
        bot.sendMessage(chatId,msg, vk_bot_settings);  
        api.setMenuItem(fromId,'settings');
        return;
    }

    if(msg.text === `Статус ВК💡️`){ 
        let txt = api.get(fromId).vk_status ? 'Выключить постоянный онлайн🌑' :'Включить постоянный онлайн🌕';
        var vk_status_settings = {
            reply_markup : {
                resize_keyboard : true,
                one_time_keyboard : false,
                keyboard : [[txt],[`Меню ${emoji.get('star')}`]]
            }
        };  
        let status = api.get(fromId).vk_status ? 'Всегда онлайн' :'По умолчанию';         
        bot.sendMessage(chatId,`Текущий статус : `+status, vk_status_settings);  
        api.setMenuItem(fromId,'settings.change_vk_status');
        return;
    }

    if(msg.text === `Выключить постоянный онлайн🌑`){      
        api.get(fromId).vk_status = false;
        bot.sendMessage(chatId,`Статус изменен${emoji.get('ok_hand')}`, menu.settings);
        api.setMenuItem(fromId,'settings');           
        return;
    }

    if(msg.text === `Включить постоянный онлайн🌕`){    
        api.get(fromId).vk_status = true;      
        bot.sendMessage(chatId,`Статус изменен${emoji.get('ok_hand')}`, menu.settings);
        api.setMenuItem(fromId,'settings');           
        return;
    }

    if(msg.text === `Выключить🔕`){      
        api.get(fromId).vk_bot.state = false;
        bot.sendMessage(chatId,`Автоответчик выключен${emoji.get('ok_hand')}`, menu.settings);
        api.setMenuItem(fromId,'settings');           
        return;
    }

    if(msg.text === `Включить🔔`){    
        api.get(fromId).vk_bot.state = true;      
        bot.sendMessage(chatId,`Автоответчик включен${emoji.get('ok_hand')}`, menu.settings);
        api.setMenuItem(fromId,'settings');           
        return;
    }

    if(msg.text === `Изменить текст ответа📝`){          
        bot.sendMessage(chatId,`Введи новый текст ответа📝`, menu.settings);
        api.setMenuItem(fromId,'settings.change_bot_text');           
        return;
    }
}


module.exports.settings = settings;