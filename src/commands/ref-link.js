module.exports = () => {

  bot.hears('/ref', async (ctx) => {

    db().then(query => {

      const id = ctx.update.message.chat.id;
      
      query(`SELECT * FROM users WHERE chat_id="${id}"`).then(res => {
        if(res[0]){
          let myId = crypt.encode(res[0].id_users);
          let url = "https://telegram.me/testebout_bot?start=" + myId;
          console.log(url);
          return ctx.reply(url);
        }
      });

    });
  });

};