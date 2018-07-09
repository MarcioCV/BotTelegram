global.Extra = require('telegraf/extra');
global.Markup = require('telegraf/markup');
const translate = require('translate');

translate.key = "AIzaSyDK1QIX3QQgPkw6x4nGdBA87TCAxr42INU";

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
      return (s4()+s4()+'#'+str+'#'+s4()+s4()).toUpperCase();
    },
    decode(str){
      return parseInt(str.split('#')[1]);
    }
  };

  global.getUser = async (ctx) => {

    const update = ctx.update;
    const id = update.hasOwnProperty('callback_query')
        ? update.callback_query.message.chat.id
        : update.message.chat.id;

    let user = await db(`SELECT * FROM users WHERE chat_id="${id}"`);
    user = user[0];

    if(user){
      const ref = (user.hasOwnProperty('id_users')) ? user.id_users : 1;
      user['ref_link'] = "https://telegram.me/testebout_bot?start=" + crypt.encode(ref);
    }

    return user;

  };

  global.traduzir = async (ctx, text) => {
    const user = await getUser(ctx);
    let l = 'en';
    if(user && user['idioma_selecionado'] !== "undefined"){
      let idioma = user['idioma_selecionado'] || 'lang_en';
      l = idioma.split('_');
      l = l.length === 2 ? l[1] : "lang_en";
    }
    let context = { from: 'pt', to: l };
    const t = await translate(text, context);
    return t;
  };

  require('./src/commands/start')();
  require('./src/commands/ref-link')();

  // bot.hears('/test', async (ctx) => {

  //   const text = await traduzir(ctx, 'Hello World my person');
  //   return ctx.reply(text);

  // });

};