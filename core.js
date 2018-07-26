global.Extra = require('telegraf/extra');
global.Markup = require('telegraf/markup');
global.shortid = require('shortid');
const translate = require('google-translate-api');
const formData = require('form-data');

translate.key = "AIzaSyDK1QIX3QQgPkw6x4nGdBA87TCAxr42INU";
        
global.ref = null;
global.usersActions = {};
global.minWithdraw = "0.01";

module.exports = (bot, db) => { 
 
  // Set Bot Telegram
  global.bot = bot;

  // Set Database BOT
  global.db = db;
  
  // Set Controller USER
  global.userController = require('./src/controllers/user');
  
  // Set FormData to request
  global.FormData = formData;
  
  // Set Api TroniPay
  global.TroniPay = async (url, d) => { 
    const data = Object.keys(d).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(d[k])}`).join('&');
    const request = await axios.post(url, data, {
      'Content-type': 'application/x-www-form-urlencoded'
    });
    const json = request.data.Response[0];
    return json;
  };

  global.clearActions = id => usersActions[id].action = '';

  global.daysBetween = function(first, second) {
      var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
      var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      var millisBetween = two.getTime() - one.getTime();
      var days = millisBetween / millisecondsPerDay;
      return Math.floor(days);
  };

  global.setInvoice = async (ctx, id, dataInvoice) => {
    let user = isUser(id);
    if(user){
      const update = db.get('users')
        .find({
          "chat_id": id
        })
        .assign({
          "invoices": [...user.invoices, dataInvoice]
        })
        .write();
      return update;
    }
    return false;
  };

  global.btcLevel = (btc, level) => {
    switch(level){
        case 0: 
          return btcPercent(btc, "10");
          break;
        case 1:
          return btcPercent(btc, "03");
          break;
        case 2:
          return btcPercent(btc, "02");
          break;
        case 'default':
          return false;
    }
  };

  global.btcParse = (btc) => {
    if (!btc) return "0.00000000";
    var b = btc.toString();
    b.replace(/(.*?)\.\d{8}/, (r) => b = r);
    return b;
  };

  global.btcPercent = (btc, percent) => {
    percent = "0." + percent;
    var b = (Number(btc) * Number(percent));
    return b.toFixed(8);
  };

  const translator = (text, context) => new Promise((res, rej) => {
    
    translate(text, context)
      .then(value => res(value.text))
      .catch(err => rej(err));

  });

  global.traduzir = async (ctx, text) => {
    let id = ctx.from.id;
    const user = db.get('users')
    .find({ "chat_id": id })  
    .value();
    if(!user) return;
    let idioma = user.idioma_selecionado.split('_')[1];
    let context = { from: 'pt', to: idioma };
    if(idioma === "pt") return text;
    return await translator(text, context);
  };

  // Actions
  require('./src/actions/menu')();
  require('./src/actions/languages')();

  // Commands
  require('./src/commands/start')();
  require('./src/commands/ref-link')();

};
