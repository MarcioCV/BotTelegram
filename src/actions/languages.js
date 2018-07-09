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
    var json = [ ref ];
   
    db().then(async (query) => {
      
      query(`SELECT * FROM users WHERE chat_id="${chat.id}"`).then(res => {

        if(res.length === 0){

          query(`SELECT * FROM users WHERE id_users="${ref}"`).then(res => {

                res = Array.from(res);
                res = res[0];

                if(res){
                  let upline = JSON.parse(res['up_line']);
                  console.log(upline);
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
            
              query(q).then((msg) => {
                if(msg) console.log('Inserido com sucesso!!');
              });

          });

        }

      }).catch(e => console.error(e));

    });
    
    return ctx.editMessageText('Selected ' + lang);

  }));

};