const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

const token = '677855746:AAHxVZXbOLcKkfZ8wT72L8Cv0hZmfOLa1f8';
const telegram = new Telegraf(token);

// telegram.on("text",function(l){console.log(l),l.reply("Hello World")});

require('./core')(telegram, db);

telegram.startPolling();
