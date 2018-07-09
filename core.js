global.Extra = require('telegraf/extra');
global.Markup = require('telegraf/markup');
const translate = require('translate');
global.ref = false;

module.exports = (bot, db) => {

  global.bot = bot;
  global.db = db;
  global.crypt = {
    encode(str){
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + s4() + '#' + str;
    },
    decode(str){
      return str.split('#')[1];
    }
  };

  // global.translate = async (text) => {
  //     db().then(query => {


        

  //     });
  // };

  require('./src/commands/start')();
  require('./src/commands/ref-link')();

};