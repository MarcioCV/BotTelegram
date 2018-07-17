const db = require('../../config/db/low');

module.exports = class User {

	constructor(ctx){
		if(!ctx) throw "error send ctx";
		// Set Context
		this.ctx = ctx;
		// Set Database
		this.db = db.get('users');
		// Set User
		this.user = this.getUser();
		// Set Model
		let chat_id = this.getId();
		this.userModel = this.db.find({ chat_id });
		// Set Scope
		this.self = this;
		// Return Scope
		return this;
	}
	
	// References Functions
	
	refInsert(refs, value){
		const model = this.db;
	    const per = v => v === 0 
	        ? btcPercent(value, "10")
	        : ( ( v === 1 ) 
	          ?  btcPercent(value, "03") 
	          :  btcPercent(value, "02")
	          );
	    refs.map((id, key) => {
	      const r = model.find({ id });
	      const rv = r.value();
	      if(!rv) return;
	      const valor = btcLevel(value, key);
	      const investTime = rv['total_ganhos_equipe'];
	      const investTotalTime = rv['total_investido_equipe'];
	      const soma = Number(investTime) + Number(valor);
	      const totalEquipe = Number(investTotalTime) + Number(value);
	      r.assign({
	        'total_ganhos_equipe': soma.toFixed(8),
	        'total_investido_equipe': totalEquipe.toFixed(8)
	      }).write();
	    });
	}

	upline(){
	  if(ref){
		  let json = [ ref ];
		  let reference = this.db.find({ id: ref }).value();
		  if (reference) {
		    let r = reference['up_line'];
		    json = [...json, ...r];
		  }
		  json = json.filter(id => id);
		  return json;
	  }
	  return [];
	}

	// User Functions

	isUser(chat_id){
		return this.db.find({ chat_id }).value();
	}

	getId(){
		return this.ctx.from.id;
	}

	getUser(){
		const id = this.getId();
		const u = this.isUser(id);
		if(!u) return false;
		let user = u;
		const ref = (user.hasOwnProperty('id')) ? user.id : 1;
	    user['ref_link'] = "https://telegram.me/testebout_bot?start=" + ref;
	    return user;
	}

	setUser(opts){
		
	   const chat_id = this.getId();
	   const upline = this.upline();

	   const data = {
          id: shortid(),
          chat_id: chat_id,
          saldo_disponivel: "0.000000000",
          saldo_investido: "0.000000000",
          total_ganhos_equipe: "0.000000000",
          total_investido_equipe: "0.000000000",
          up_line: upline,
          invoices: [],
          data_deposito: null,
          idioma_selecionado: opts.lang,
          data_saque: 0
      }; 

      try{

		const user = this.db.push(data).write();

      }catch(e){

      	throw e;

      }
	  
	}

	// Payments Functions
	sendPayment(valor, wallet){
	    console.log("Send payment ", valor);
	    console.log("Wallet ", wallet);
	    // const payment = TroniPay('url', {
	    //   amount: valor,
	    //   wallet: wallet
	    // })
	    // if(payment){
	    //   console.log("Valor foi enviado para ", wallet);
	    // }else{
	    //   console.log("Error send payment ", wallet);
	    // }
	  }

	// Invoices Functions
	setInvoice(dataInvoice){
	    let user = this.user;
	    if(user){
	      const update = this.userModel.assign({
	        "invoices": [...user.invoices, dataInvoice]
	      }).write();
	      return update;
	    }
	    return false;
    }

    updateInvoice(state){
		return this.userModel.assign(state).write();
    }

    getInvoices(){
	    return this.user.invoices;
	}

	// Saldo functions

	getSaldo(){
		let user = this.user;
	    let saldo_dis = user['saldo_investido'];
	    saldo_dis = Number(saldo_dis) !== 0.00000000 ? (btcPercent(user['saldo_investido'], '012')) : 0.00000000;
	    if(user['data_deposito'] !== null){
	      saldo_dis = saldo_dis * (daysBetween(
	        new Date(user['data_deposito']),
	        new Date()
	      ));
	    }
	    saldo_dis = saldo_dis + Number(user['total_ganhos_equipe']);
	    return saldo_dis.toFixed(8);
	}

	updateSaldo(state){
	  this.userModel.assign(state).write();
	}

	clearSaldo(){
		let user = this.user;
	    user['saldo_investido'] = "0.00000000";
	    user['data_deposito'] = null;
	    user['data_saque'] = new Date().toString();
	    let write = this.db
	      .find({ id: user.id })
	      .assign(user)
	      .write();
	    if(write){
	      console.log(`Saldo foi zerado com sucesso!! ${user.id}`);
	    }
	}

};