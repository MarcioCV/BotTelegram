module.exports = () => {

  const langs = [
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
    
    const chat = ctx.update.callback_query.message.chat;
    let json = [ ref ];
    json = JSON.stringify(json);
   
    db().then(async (query) => {
      
      query(`SELECT * FROM users WHERE chat_id="${chat.id}"`).then(res => {

        if(res.length === 0){

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
        
          query(q).then((msg) => {
            console.log(msg);
          })

        }

      }).catch(e => console.error(e));

    });
    
    return ctx.editMessageText('Selected ' + lang);

  }));

};