const Telegraf = require('telegraf');
const db = require('./config/db/low');
const fs = require('fs');

const token = '697315596:AAGyXqGhgS__s2SMVdy4cRkneVSDE9EYJkM';
const telegram = new Telegraf(token);

require('./core')(telegram, db);

telegram.startPolling();  