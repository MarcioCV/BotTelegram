module.exports = () => {

  bot.hears('/ref', (ctx) => {

   // const user = await getUser(ctx);
    const user = new userController(ctx);
    return ctx.reply(user.user['ref_link']);

  });

};
