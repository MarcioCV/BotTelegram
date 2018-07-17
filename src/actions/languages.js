module.exports = () => {

  let langs = [
    "lang_pt",
    "lang_en",
    "lang_ru",
    "lang_ch",
    "lang_es",
    "lang_fr",
    "lang_ja",
    "lang_ar",
    "lang_in"
  ];

  langs.map(lang => bot.action(lang, async (ctx) => {

    let chat = ctx.update.callback_query.message.chat;
    const user = new userController(ctx);

    if (!user.isUser(chat.id)) {
      const insert = user.setUser({ lang });
      if (insert) console.log("Inserido com sucesso!!");
    }

    const menu = await require('../commands/menu')(ctx);

    return ctx.telegram.sendMessage(
      ctx.from.id,
      await traduzir(ctx, "Escolha sua opçao no menu"),
      menu
    );

  }));

};
