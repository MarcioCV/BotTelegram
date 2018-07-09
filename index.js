const Telegraf = require('telegraf');

global.Buffer = global.Buffer || require('buffer').Buffer;

const db = require('./config/db/db');
const fs = require('fs');

const token = '584173010:AAHvFZdLD47MweStNfGfJboI_TMCDTNw_WU';

const telegram = new Telegraf(token);

//telegram.hears('hi', (ctx) => ctx.reply('Hey there'))
//telegram.hears(/buy/i, (ctx) => ctx.reply('Buy-buy'))

require('./core')(telegram, db);

telegram.startPolling();