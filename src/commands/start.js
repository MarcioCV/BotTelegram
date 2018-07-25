module.exports = () => {

  const inlineMessageRatingKeyboard = Markup.inlineKeyboard([
    [
      Markup.callbackButton('English 🇺🇸', 'lang_en'),
      Markup.callbackButton('Portuguese 🇧🇷', 'lang_pt'),
    ],
    [
      Markup.callbackButton('Spanish 🇪🇸', 'lang_es'),
      Markup.callbackButton('French 🇫🇷', 'lang_fr')
    ],
    [
      Markup.callbackButton('Russian 🇷🇺', 'lang_ru'),
      Markup.callbackButton('中國 🇨🇳', 'lang_ch')
    ],
    [
      Markup.callbackButton('Indian 🇮🇳', 'lang_in'),
      Markup.callbackButton('Arabian 🇸🇦', 'lang_ar')
    ],
    [
      Markup.callbackButton('Japan 🇯🇵', 'lang_ja')
    ]
  ]).extra();

  bot.start(async (ctx) => {   

    const {
      update
    } = ctx;

    if (update.message) {
      let r = update.message.text;
      let idRef = r.replace(/\/start/gim, '');
      global.ref = idRef.trim();  
    }

    // const u = await getUser(ctx);
    const u = new userController(ctx);

    if(!u.user){
      ctx.telegram.sendMessage(
        ctx.from.id,
        'Please select your language',
        inlineMessageRatingKeyboard
      );
    }else{
      const menu = await require('./menu')(ctx);
      ctx.telegram.sendMessage(
        ctx.from.id,
        'TED - Trader Experts Dynamics',
        menu
      );
    }

  });  

};
