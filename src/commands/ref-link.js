module.exports = () => {

  bot.hears('/ref', async (ctx) => {

    const user = await getUser(ctx);
    return ctx.reply(user['ref_link']);

  });

};