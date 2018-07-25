const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

const token = '661662510:AAEdhxymnv3H9sZisfyWpRoxSJ5jq2v666M';
const telegram = new Telegraf(token);

require('./core')(telegram, db);

telegram.startPolling();   