global.axios = require('axios');

module.exports = () => {

  const patternBtc = /(.*)[0-9]\.(.*)[0-9]/i;

  bot.hears(/💰/i, async (ctx) => {

      let ctrl = new userController(ctx);
      let user = ctrl.user;
      let btc = v => btcParse(v);

      let saldoFinal = ctrl.getSaldo(user);
      console.log(saldoFinal);
      let investiments = [ctrl.getInvestiment()];
      let reinvestiments = [ctrl.getReinvestiment()];

      investiments.filter(i => i !== null && i !== undefined).map(i => Object.assign(i, { type: 'Investimento' }));
      reinvestiments.filter(i => i !== null && i !== undefined).map(i => Object.assign(i, { type: 'Reinvestimento' }));

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
      let trans = await traduzir(ctx, `Saldo:\n  *${saldoFinal}* BTC\nSaldo Investido\n  *${btc(user['saldo_investido'])}* BTC\nSaldo Total Da Rede\n  *${btc(user['total_investido_equipe'])}* BTC\nTotal Ganho Comissoes\n  *${btc(user['total_ganhos_equipe'])}* BTC\nInvestimentos\n  ${inv} \nComece agora com seu investimento de apenas *0.005* BTC\n
Base: *1.2%* por dia ( *0.35%* de 6 em 6 horas )\nAdicione um deposito clicando no botão *Deposito*.\n
Seu saldo cresce de acordo com o porcetagem base e seus referidos
`);

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
      return ctx.replyWithMarkdown(await traduzir(ctx, 'Se você não digitar o valor correto no exemplo abaixo , sua carteira para este deposito não será gerada\n\nDigite no campo de mensagem abaixo o valor que deseja depositar\n\n*No minimo 0.005 * \n\n*Ex: (0.005)* '));
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
    if(verify.status == 1){
    
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
      
      if(Number(deposito) < 0.005){
        return await ctx.replyWithMarkdown(await traduzir(ctx,"Valor abaixo do minimo *Minimo: 0.005*"));
      }
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
        payment: false,
        saques: []
      });

      let msg1 = await ctx.replyWithMarkdown(await traduzir(ctx, `
      *Este é o seu endereço BTC exclusivamente para este deposito*  , por razões de segurança, cada endereço é apenas para um depósito.\nNunca use o mesmo endereço para dois ou mais depositos *ou TODOS os valores enviados depois do primeiro deposito serão perdidos*:
    `));
      let msg2 = await ctx.replyWithMarkdown(await traduzir(ctx, `
      Valor: *${data.amount} BTC*\nCarteira: *${data.wallet}*
    `));
      let msg3 = await ctx.replyWithMarkdown(await traduzir(ctx, `Você pode realizar novos depositos a qualquer momento . Atenção , envie apenas Bitcoins para esta carteira, qualquer outra moeda ( como Litecoins ) será perdida para sempre!`));
      let pay = await ctx.telegram.sendMessage(
        ctx.from.id, 
        await traduzir(ctx, 'Após as devidas confirmações da rede clique no botão abaixo para creditar o valor depositado em seu saldo'), 
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
        return ctx.replyWithMarkdown(await traduzir(ctx, `Você não possui o saldo minimo necessário para reinvetimento , *minimo 0.005*`));
      }

    }  

  });

  // Init Withdraw
  bot.hears(/📤/i, async (ctx) => {
    let id = ctx.update.message.chat.id;
    if(!usersActions[id]) usersActions[id] = {action:''};
    let ctrl = new userController(ctx);
    const user = ctrl.user;
    const valor = ctrl.getSaldo();

    var semana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    var d = new Date();
    var n = d.getDay();
    var diaSemana = semana[n];

    if(diaSemana == 'domingo' || diaSemana == 'sabado' || diaSemana == 'sexta'){
	    ctx.reply(await traduzir(ctx, 'De fim de semana nao pode sacar'));
	    return;
    }

    if(valor == "0.00000000"){
        usersActions[id].action = 'withdraw';
        return ctx.replyWithMarkdown(await traduzir(ctx, `
          Você não possui saldo o suficiente para saque.\nO minimo para saque é de *0.01 BTC*
        `));
    }else{
        usersActions[id].action = 'withdraw';
        return ctx.replyWithMarkdown(await traduzir(ctx, `Você está prestes a fazer o saque de *( ${valor} )* BTC\nDigite sua carteira Bitcoin abaixo.`));
    }
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
      let valorTotal = ctrl.getSaldo();
      valorTotal = Number(valorTotal) - Number(btcPercent(valorTotal , "10"));

      if(Number(valorTotal) >= 0.01){
        
        const request = await TroniPay('https://tronipay.com/api/json/Payment', {
            invoice: Math.floor(Math.random() * 100000),
            amount: valorTotal,
            merchant_id: 'ZVpfqaPhTxbyAKXEjikRF9lS0OdsDY',
            currency: '3',
            wallet: wallet
        });

        // request.status
        if(verify.status == 1){
            ctx.replyWithMarkdown(await traduzir(ctx, `
          Saque de *${valorTotal} BTC* foi relizado!!\nFoi enviado para a carteira: ${wallet}
        `));
            ctrl.clearSaldo(valorTotal);
        }

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
  bot.hears(/📚/i, async (ctx) => {
      const ctrl = new userController(ctx);
      if(ctrl.user.invoices.length === 0){
        ctx.replyWithMarkdown(await traduzir(ctx, `
            *Você nao possui historico.*
        `));
      }
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
      return ctx.replyWithMarkdown(await traduzir(ctx, 'Digite no campo de mensagens como no exemplo o valor que deseja reinvestir, minimo de (0.01) exemplo:  *0.01*'));
  });

  // Equipe
  
  bot.hears(/👧👦/i, async (ctx) => {
    let ctrl = new userController(ctx);
    let user = ctrl.user;
    let ativos = [];
    let model = db.get('users');
    // "saldo_investido"
    await ctx.reply(await traduzir(ctx, `
          Sistema de Referidos:\n🥇 Nivel 10%\n🥈 Nivel 3%\n🥉 Nivel 2%\n\nSeu link de referência para compartilhar com seus amigos:\n${user.ref_link}
    `));
    await ctx.replyWithMarkdown(await traduzir(ctx, `
       Suas estatísticas de referência\nTotal de Referidos: *${user.refs.length}*\nReferidos Activos: *${user.refs.length}*\nInvestimentos de Referidos: *${user.total_investido_equipe} BTC*\nO seu Ganho: *${user.total_ganhos_equipe} BTC*
    `));
  });

  bot.hears(/ℹ️/i, async (ctx) => {
     await ctx.replyWithMarkdown(await traduzir(ctx, `
       Sobre Nós? 
                        
 O nosso lançamento oficial foi em 06.07.17.
Esforçamos para oferecer um projeto que possa confiar e usar para alcançar a SUA liberdade financeira.
Com nossa vasta experiência nas áreas em que trabalhamos, ajudamos empresários a investir com sabedoria , ganhando receitas de mais de 20 fontes diferentes de renda apenas investindo em um só lugar.


Você pode ver onde seu dinheiro está indo e de onde é proveniente diariamente através de nossos relatórios, você pode encontrar nossos relatórios no nosso site em: http://iCenter.co                
        
                        O que Oferecemos?
                        
                        - 1.2% do seu investimento diário por 99 dias
                        - Ganhando a cada 6 horas
                        - Min. Investimento 0.005 BTC
                        - Min. Reinvesto 0.1 BTC
                        - Min. Saque 0.1 BTC
                        - Bonus de Referência em 3 Niveis:
                           .Nivel 1 - 10%
                           .Nivel 2 - 3%
                           .Nivel 3 - 2% 
                        - Sempre uma super promoção
                        - Consistência e Estabilidade
                        - Suporte ao vivo pelo Website iCenter.co
                        - Relatórios diários sobre o projeto
                        - Projeto com Plano de 5 anos
                        
                        E muitos outros recursos em breve!
                        
                        :cop: IMPORTANTE :cop:
Não temos nenhum suporte direto trabalhando via Telegram, qualquer pessoa que reivindique ser nosso suporte ou programadores é um "scammer", por favor denuncie a abuse@telegram.org. Se você precisar de ajuda, nosso único suporte direto é através do nosso site:
http://iCenter.co
                        
                        Leia também este artigo importante para focar o melhor informado possível:
A iCenter é um Ponzi?
https://icenter.co/icenter-ponzi-important-kiss-method/

Obrigado
Equipe iCenter.co
    `));
  });

};
