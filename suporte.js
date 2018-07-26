const Telegraf = require('telegraf')
const bot = new Telegraf('637009093:AAHpoh_nkq7TJVXs3O2p2D-mm2UE2px23RE');
const fs = require('fs');
const db = require('./config/db/low');
var map = new WeakMap();
var fsTimeout;

const streamInit = (ctx) => {	
	fs.watch('db.json', function(e) {
	    if (!fsTimeout) {
	    	fs.readFile('./db.json', {encoding: 'utf-8'}, function(err, data){
			    if (!err) {
			    	data = JSON.parse(data);
			        let invoices = data.invoices;
			        invoices = invoices[(invoices.length - 1)];
			        if(invoices){
			        	ctx.replyWithMarkdown(`
							hey someone just invest *${invoices.value} BTC*
			        	`);
			        }
			    } else {
			        console.log(err);
			    }
			});
	        fsTimeout = setTimeout(function() { fsTimeout=null }, 5000);
	    }
	});
}; 

bot.start(streamInit);
bot.startPolling();
