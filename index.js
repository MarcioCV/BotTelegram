const TelegramBot = require('node-telegram-bot-api');

const token = '584173010:AAHvFZdLD47MweStNfGfJboI_TMCDTNw_WU';

const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);

});

bot.onText(/\/start/, (msg, match) => {

  const chatId = msg.chat.id;
  
  bot.sendMessage(msg.chat.id, "Select language", {
    "reply_markup": {
      "keyboard": [
        ["English(us)", "Portuguese(pt-BR)"]
      ]
    }
  });

});


// bot.on('message', (msg) => {

//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Received your message ' + chatId);

// });