module.exports = async (ctx) => {

  const user = await getUser(ctx);

  const s = user['saldo_disponivel'] === "undefined" 
    ? "0.00000000"
    : user['saldo_disponivel'];

  const saldo = s === 0 ? "0.00000000" : user['saldo_disponivel'];

  const msg = async (m) => await traduzir(ctx, m);

  const inlineMessageRatingKeyboard = Markup.keyboard([
    [
      Markup.callbackButton(await msg(`Saldo`) +  ` ${saldo} 💰`, 'lang_en'),
    ], [
      Markup.callbackButton(await msg(`Deposito`) + " 💷", 'lang_es'),
      Markup.callbackButton(await msg(`Saques`) + " 📤", 'lang_fr')
    ], [
      Markup.callbackButton(await msg(`Re-investir`) + " ♻️", 'lang_ru'),
      Markup.callbackButton(await msg(`Historico`) + " 📚", 'lang_ch')
    ], [
      Markup.callbackButton(await msg(`Equipe`) + " 👧👦", 'lang_in'),
      Markup.callbackButton(await msg(`Ajuda`) + " ℹ️", 'lang_ar')
    ]
  ]).extra();

  return inlineMessageRatingKeyboard;

};