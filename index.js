const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

// trocar o token
const token = '623626839:AAFV_w484y2OoGNP6fCsuOMgNtshlTAgFcM';

const telegram = new Telegraf(token, {
	webhookReply: false
});

// telegram.on('text', (ctx) => {
// 	console.log(ctx);
// 	ctx.reply('Hello World')
// 	return;
// });

require('./core')(telegram, db);

// telegram.catch((err) => {
// 	console.error('\n---- ERROR telegram bot:\n');
//   	console.error(err);
//   	telegram.stop()
// });

telegram.startPolling();   
