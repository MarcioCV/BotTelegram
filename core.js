global.Extra = require('telegraf/extra');
global.Markup = require('telegraf/markup');
const translate = require('translate');
global.ref = false;

module.exports = (bot, db) => {

  global.bot = bot;
  global.db = db;
  // global.translate = async (text) => {
  //     db().then(query => {


        

  //     });
  // };

  require('./src/commands/start')();

};