global.axios = require('axios');

module.exports = () => {

  const patternBtc = /(.*)[0-9]\.(.*)[0-9]/i;

  bot.hears(/💰/i, async (ctx) => {

      let ctrl = new userController(ctx);
      let user = ctrl.user;
      let btc = v => btcParse(v);
      let list = {
        "|": "\n",
        "amp;": `
        
        `,
        "&quot;": '"',
        "table": "  "
      };
      
      let saldo_dis = ctrl.getSaldo(user);
      let investiments = [ctrl.getInvestiment()];
      let reinvestiments = [ctrl.getReinvestiment()];

      investiments.map(i => Object.assign(i, { type: 'Investimento' }));
      reinvestiments.map(i => Object.assign(i, { type: 'Reinvestimento' }));

      let allInvestiments = [ ...investiments, ...reinvestiments ];
      
      let all = allInvestiments
      .filter(i => typeof(i) === "object")
      .filter(i => daysBetween(new Date(i.data_payment), new Date()) <= 100)
      .map(i => `
        ${i.type} ID: *${i.invoice}*
        ${i.type} Valor: *${Number(i.value).toFixed(8)} BTC* 
        ${i.type} Data: *${(new Date(i.data_payment)).toLocaleString()}*
        Dias Para Acabar: *${ 100 - parseInt(daysBetween(new Date(i.data_payment), new Date())) } dias*
      `);

      let inv = all.join(' ');

      let trans = (await traduzir(ctx, `Saldo:|table*${saldo_dis}* BTC|Saldo Investido|table*${btc(user['saldo_investido'])}* BTC|Saldo Total Da Rede|table*${btc(user['total_investido_equipe'])}* BTC|Total Ganho Comissoes|table*${btc(user['total_ganhos_equipe'])}* BTC|Investimentos|table${inv} ||Comece agora com seu investimento de apenas *0.005* BTC|
Base: *1.2%* por dia ( *0.35%* de 6 em 6 horas ) ||Adicione um deposito clicando no botão "Deposito". |
Seu saldo cresce de acordo com o porcetagem base e seus referidos |
`)).replace(/(&quot;|\||amp;|table)/gim, (r) => list[r]);
    
    ctx.replyWithMarkdown(trans);

    const menu = await require('../commands/menu')(ctx);

    ctx.telegram.sendMessage(
      ctx.from.id,
      ".",
      menu
    );
    

  });

  // Init Payment

  bot.hears(/💷/i, async (ctx) => {
      let id = ctx.update.message.chat.id;
      if(!usersActions[id]) usersActions[id] = {action: ''};
      usersActions[id].action = "deposit";
      return ctx.replyWithMarkdown(await traduzir(ctx, 'Só basta me enviar o valor agora *( min 0.005 )*'));
  });

  // Verify Payment

  bot.action('verify_payment', async (ctx) => {
    let id = ctx.update.callback_query.from.id;
    
    let ctrl = new userController(ctx);
    let user = ctrl.user;
    let userInvoices = ctrl.getInvoices();

    if(userInvoices.length === 0) return;

    const iid = userInvoices.length - 1;
    const invoices = userInvoices[iid];

    const verify = await TroniPay(
      "https://www.tronipay.com/api/json/Status", {
          'merchant_id': 'ZVpfqaPhTxbyAKXEjikRF9lS0OdsDY',
          'invoice': invoices.invoice
    });

    // verify.status
    if("1" == "1"){
    
      invoices.payment = true;
      invoices.data_payment = new Date().toString();

      var spl = Number(invoices.value).toFixed(8);

      userInvoices[iid] = invoices;

      ctrl.updateInvoice({ 
        "saldo_investido": spl,
        "data_deposito": invoices.data_payment,
        "invoices": userInvoices
      });

      ctx.reply(await traduzir(ctx, "Pagamento realizado com sucesso!!"));

      ctrl.refInsert(user.up_line, spl);

      const menu = await require('../commands/menu')(ctx);

      ctx.telegram.sendMessage(
        ctx.from.id,
        ".",
        menu
      );
    
    }else{
      ctx.reply(await traduzir(ctx, "Aguardando pagamento"));
    }

  });

  // Create Payment
  bot.hears(patternBtc, async (ctx) => {
    let id = ctx.update.message.chat.id;
    const user = usersActions[id] ? usersActions[id] : {action:''};

    let ctrl = new userController(ctx);

    if(user.action === "deposit"){

      let deposito = ctx.match[0];
      let g = () => Math.random() * 100000;
      let id_inv = Math.floor(g() + g() + g()+ g());

      const d = {
        'merchant_id': 'ZVpfqaPhTxbyAKXEjikRF9lS0OdsDY',
        'invoice': `${id_inv}`,
        'amount': deposito,
        'currency': '3'
      };
      const data = await TroniPay('https://www.tronipay.com/api/json/Create', d);

      const inv_set = ctrl.setInvoice({
        invoice: data.invoice,
        value: deposito,
        data: new Date().toString(),
        data_payment: 0,
        payment: false
      });

      let msg1 = await ctx.reply(await traduzir(ctx, `
      Este é o seu endereço BTC pessoal para o seu depósito, por razões de segurança, cada endereço é apenas para um depósito. Depois de adicionar o primeiro depósito aguarde a confirmação no seu Bot para gerar outro endereço para outro depósito:
    `));
      let msg2 = await ctx.replyWithMarkdown(await traduzir(ctx, `
      Valor: *${data.amount} BTC*\nCarteira: *${data.wallet}*
    `));
      let msg3 = await ctx.replyWithMarkdown(await traduzir(ctx, `Você pode depositar a qualquer momento tanto quanto você quiser ( *minimo 0.005 BTC* ). Por Favor, envie apenas Bitcoins para esta carteira, qualquer outra moeda ( como Litecoins ) será perdida para sempre!`));
      let pay = await ctx.telegram.sendMessage(
        ctx.from.id, 
        await traduzir(ctx, 'Clique no botão para atualizar o status de pagamento'), 
        Extra.markup(Markup.inlineKeyboard([
          Markup.callbackButton(await traduzir(ctx, `Verificar Pagamento`), 'verify_payment')
        ]))
      );
      clearActions(id);
    }

    if(user.action === "reinvest"){

      let reinvestir = ctx.match[0];
      let userInfo = ctrl.user;
      if(ctrl.getSaldo() >= 0.005){

        let re = ctrl.reinvest(reinvestir);
        return ctx.replyWithMarkdown(await traduzir(ctx, `O valor de *( ${reinvestir} )* foi reinvestido com sucesso.`));

      }else{
        return ctx.replyWithMarkdown(await traduzir(ctx, `Ocorreu um erro ao reinvestir o valor de *( ${reinvestir} )*.`));
      }

    }

  });

  // Init Withdraw
  bot.hears(/📤/i, async (ctx) => {
    let id = ctx.update.message.chat.id;
    if(!usersActions[id]) usersActions[id] = {action:''};
    usersActions[id].action = 'withdraw';
    let ctrl = new userController(ctx);
    const user = ctrl.user;
    const valor = ctrl.getSaldo();
    return ctx.replyWithMarkdown(await traduzir(ctx, `Você está prestes a fazer o saque de *( ${valor} )* BTC\nDigite sua carteira Bitcoin abaixo.`));
  });

  // Set wallet withdraw btc
  const walletPat = /(?:^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34})$)/;
  bot.hears(walletPat, async (ctx) => {
    let wallet = ctx.message.text;
    let ctrl = new userController(ctx);
    const id = ctrl.user.chat_id;
    const user = usersActions[id] ? usersActions[id] : {action:''};
    if(user.action === "withdraw"){

      let ctrl = new userController(ctx);
      let user = ctrl.user;
      const valorTotal = ctrl.getSaldo();

      const days = daysBetween(
        new Date(user['data_deposito']),
        new Date()
      );

      // if(!(minWithdraw > valorTotal)){
      if(days >= 100){

        ctx.replyWithMarkdown(await traduzir(ctx, `
          Saque de *${valorTotal} BTC* foi relizado!!\nFoi enviado para a carteira: ${wallet}
        `));
        
        ctrl.sendPayment(valorTotal, wallet);
        ctrl.clearSaldo();

        const menu = await require('../commands/menu')(ctx);

        ctx.telegram.sendMessage(
          ctx.from.id,
          ".",
          menu
        );

      }else{
        ctx.replyWithMarkdown(await traduzir(ctx, `
          Saque de *${valorTotal} BTC* foi rejeitado.\nPois atingiu apenas ${days} dias, Ainda falta ${100 - days} dias para o saque.
        `));
      }
      clearActions(id);
    }
  });

  // Historico 
  bot.hears(/📚/i, (ctx) => {
      const ctrl = new userController(ctx);
      ctrl.user.invoices.map(async (invoice, key) => {
          ctx.replyWithMarkdown(await traduzir(ctx, `
            ID: *${key}*\nID Invoice: *${invoice.invoice}*\nValor: *${invoice.value}*\nData: *${(new Date(invoice.data)).toLocaleString()}*\nPagamento Status: *${invoice.payment}*
          `));
      });
  });

  // Reinvestir
  
  bot.hears(/♻️/i, async (ctx) => {
      let id = ctx.update.message.chat.id;
      if(!usersActions[id]) usersActions[id] = {action: ''};
      usersActions[id].action = "reinvest";
      return ctx.replyWithMarkdown(await traduzir(ctx, 'Só basta me enviar o valor agora *( min 0.005 )*'));
  });


};
