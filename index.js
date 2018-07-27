const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

const token = '661662510:AAEdhxymnv3H9sZisfyWpRoxSJ5jq2v666M';
const telegram = new Telegraf(token);

// telegram.on('text', (ctx) => {
// 	console.log(ctx);
// 	ctx.reply('Hello World')
// 	return;
// });

require('./core')(telegram, db);

telegram.catch((err) => {
	console.error('\n---- ERROR telegram bot:\n');
  	console.error(err);
  	telegram.stop()
});

telegram.startPolling();   
