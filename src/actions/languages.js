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
    var json = [ ref ];
   
    let ress = await db(`SELECT up_line FROM users WHERE chat_id="${chat.id}"`);

    if(ress.length === 0){

        let res = await db(`SELECT chat_id FROM users WHERE id_users="${ref}"`);

        res = Array.from(res);
        res = res.length === 1 ? res[0] : false;

        if(res){
          let upline = JSON.parse(res['up_line']);
          json = [ ...json, ...upline ];
        }

        json = JSON.stringify(json);
                  

        let q = `
                    INSERT INTO users(
                      chat_id , 
                      saldo_disponivel, 
                      saldo_investido,
                      total_ganhos_equipe,
                      total_investido_equipe,
                      up_line,
                      data_deposito,
                      idioma_selecionado,
                      data_saque
                    ) VALUES (
                      "${chat.id}",
                      "0",
                      "0",
                      "0",
                      "0",
                      '${ json }',
                      null,
                      "${ lang }",
                      null
                    )
      `;
              
      const insert = await db(q);
      if(insert) console.log('Inserido com sucesso!!');

    }

    const menu = await require('../commands/menu')(ctx);
    
    return ctx.telegram.sendMessage(
      ctx.from.id,
      await traduzir(ctx, "Escolha sua opçao no menu"),
      menu
    );

    // return ctx.editMessageText(await traduzir(ctx, 'Selected ' + lang));

  }));

};