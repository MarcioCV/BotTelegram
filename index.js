const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

const token = '584173010:AAHvFZdLD47MweStNfGfJboI_TMCDTNw_WU';
const telegram = new Telegraf(token);

require('./core')(telegram, db);

telegram.startPolling();