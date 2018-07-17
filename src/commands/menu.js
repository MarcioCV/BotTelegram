module.exports = async (ctx) => {

  let ctrl = new userController(ctx);
  let saldo = ctrl.getSaldo();

  const msg = async (m) => await traduzir(ctx, m);

  const inlineMessageRatingKeyboard = Markup.keyboard([
    [
      Markup.callbackButton(await msg(`Saldo`) + ` ${saldo} 💰`, 'saldo'),
    ],
    [
      Markup.callbackButton(await msg(`Deposito`) + " 💷", 'lang_es'),
      Markup.callbackButton(await msg(`Saques`) + " 📤", 'lang_fr')
    ],
    [
      Markup.callbackButton(await msg(`Re-investir`) + " ♻️", 'lang_ru'),
      Markup.callbackButton(await msg(`Historico`) + " 📚", 'lang_ch')
    ],
    [
      Markup.callbackButton(await msg(`Equipe`) + " 👧👦", 'lang_in'),
      Markup.callbackButton(await msg(`Ajuda`) + " ℹ️", 'lang_ar')
    ]
  ]).extra();

  return inlineMessageRatingKeyboard;

};
