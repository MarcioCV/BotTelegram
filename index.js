const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

const token = '631598571:AAETNnSnN0KH2l6IXd-7c8J3qWpmFOMRCVo';
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
