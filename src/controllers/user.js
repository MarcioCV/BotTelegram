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

	conta(){
		return {
			saldo: 0,
			pendences: [],
			addPend(pend){
				this.pendences.push(pend);
			},
			increment(value){
				this.saldo = Number(this.saldo) + Number(value);
			},
			decrement(value){
		    	this.saldo = Number(this.saldo) - Number(value);
			},
			final(){
				if(this.pendences.length > 0) this.pendences.map(p => this.saldo = this.saldo - Number(p));
				return this.saldo.toFixed(8);
		    }
		};
	}

// conta.increment('0.1');
// conta.decrement('0.05');
// conta.final();
// conta.addPend('0.03');
// conta.addPend('0.01');
// conta.final();
	
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
		  let u = this.user;
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
	    user['ref_link'] = "https://t.me/tedbtc_bot?start=" + ref;
	    return user;
	}

	setUser(opts){
		
	   const pushRef = this.pushRef;
	   const chat_id = this.getId();
	   const id = shortid();
	   const upline = this.upline(id).filter(f => f !== "/start");
	   upline.map(idr => pushRef(id, idr));

	   const data = {
          id: id,
          chat_id: chat_id,
          saldo_disponivel: "0.000000000",
          saldo_investido: "0.000000000",
          total_ganhos_equipe: "0.000000000",
          total_investido_equipe: "0.000000000",
          up_line: upline,
          invoices: [],
          reinvest: [],
          refs: [],
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

	// Reinvest Functions
	reinvest(deposito){
	  let user = this.user;
      const update = this.userModel.assign({
	   "reinvest": [...user.reinvest, {
	        invoice: shortid(),
	        value: deposito,
	        data: new Date().toString(),
	        data_payment: new Date().toString(),
	        payment: false,
	        saques: []
	    }]
	  }).write();
	  return update;
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

	getReinvests(){
	    return this.user.reinvest;
	}

	getLastInvoice(){
		let invoice = this.getInvoices();
		if(Array.isArray(invoice)){
			if(invoice.length > 0){
				return invoice[( invoice.length - 1 )];
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	getLastReinvest(){
		let invoice = this.user.reinvest;
		if(Array.isArray(invoice)){
			if(invoice.length > 0){
				return invoice[( invoice.length - 1 )];
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	getReinvest(){
		let user = this.user;
		if(Array.isArray(user['reinvest'])){
			if(user['reinvest'].length > 0){
				let rein = user['reinvest'][(user['reinvest'].length - 1)];
				return rein;
			}else{
				return { value: 0.00000000 };
			}
		}else{
			return false;
		}
	}

	getInvestiment(){
		let user = this.user;
		let invoice = this.getLastInvoice();
		if(invoice){
			return invoice;
		}
	}

	getReinvestiment(){
		let user = this.user;
		let invoice = this.getLastReinvest();
		if(invoice){
			return invoice;
		}
	}

	// Saldo functions
	clearInvest(){
		let dias = data => daysBetween(new Date(data), new Date());
		let user = this.user;
		if(user['saldo_investido']){
			let dia = Number(dias(user['data_deposito']));
			if(dia > 80){
				this.userModel.assign({
					"saldo_investido": "0.00000000",
					"data_deposito": null
				}).write();
			}
		}
	}

	getSaldo(){

		this.clearInvest();

		let user = this.user;
		const conta = this.conta();
	    let investiment = this.getInvestiment();
	    let reinvest = this.getReinvest();

	    if(investiment === undefined) return "0.00000000";

	    let saldo_dis = 0;
	    conta.increment(saldo_dis); 

	    let dias = data => daysBetween(new Date(data), new Date());

	    saldo_dis = Number(investiment.value) !== 0.00000000 
	    		? (btcPercent(investiment.value, '015'))
	    		: "0.00000000";

	    let reinv_dis = Number(reinvest.value) !== 0.00000000 
	    		? (btcPercent(reinvest.value, '015')) 
	    		: 0.00000000; 

	    if(investiment.data_payment !== null  && investiment.payment == true){
	      let dd = Number(dias(investiment.data_payment));
	      if(dd <= 80){
	      	saldo_dis = Number(saldo_dis) * Number(dd);
	      	saldo_dis = Number(saldo_dis) === 0 ? 0.00000000 : Number(saldo_dis);
	      	conta.increment(saldo_dis);
	      }else{
	      	saldo_dis = Number(saldo_dis) * 80;
	      	conta.increment(saldo_dis);
	      }
	      if(investiment.saques.length > 0){
	      	investiment.saques.map(s => conta.addPend(s));
	      }
		}
		else{
			conta.increment("0.00000000");
		}

	    if(Number(reinvest.value) !== 0.00000000 && reinvest.payment == true){
	    	let diasReinv = Number(dias(reinvest['data_payment']));
	    	let calc = 0;
	    	if(diasReinv <= 80){
	    		calc = ( Number(reinv_dis) * Number(diasReinv) );
	    	}else{
				calc = ( reinv_dis * 80 ); 
	    	}
	    	// saldo_dis = Number(saldo_dis) + Number(calc);
			conta.increment(calc);
			if(reinvest.saques.length > 0){
				reinvest.saques.map(s => conta.addPend(s));
			}
		}
		else{
			conta.increment("0.00000000");
		}

	    if(Number(reinvest.value) <= saldo_dis){
	    	//saldo_dis = saldo_dis - Number(reinvest.value);
	    	conta.decrement(Number(reinvest.value));
	    }
	     
	    // saldo_dis = Number(saldo_dis) + Number(user['total_ganhos_equipe']);
		conta.increment(Number(user['total_ganhos_equipe']));

	    return conta.final();

	}

	pushRef(id, ref){
	  let f = db.get('users').find({ id: ref });
	  let v = f.value();   
	  f.assign({ refs: [...v.refs, id] }).write();
	} 

	updateSaldo(state){
	  this.userModel.assign(state).write();
	}

	verifyActive(){
		let investiment = this.getInvestiment();
	    let reinvest = this.getReinvest();
	    let dias = dia => daysBetween(new Date(dia), new Date());
	    let verifyInv = dias(investiment.data_payment);
	    let reinvestInv = dias(reinvest.data_payment);
	    if(verifyInv <= 80){
	    	return "investiment";
	    }else{
	    	if(reinvestInv <= 80){
	    		return "reinvestiment";
	    	}else{
	    		return false;
	    	}
	    }
	}

	clearSaldo(value = 0.00000000){
		let user = this.user;
	    user['saldo_investido'] = "0.00000000";
	    user['data_deposito'] = null;
	    user['data_saque'] = new Date().toString();

	    let type = this.verifyActive();
		
		if(type === "investiment"){

			let invs = this.getInvoices();
			const iid = invs.length - 1;
			invs[iid].saques.push(value);
			this.updateInvoice({ 
		       "invoices": invs
		    });

		}else{
			if(type != false){
				let invs = this.getReinvests();
				const iid = invs.length - 1;
				invs[iid].saques.push(value);
				this.updateInvoice({ 
			       "reinvest": invs
			    });
			}
		}

	    let write = this.db
	      .find({ id: user.id })
	      .assign(user)
	      .write();
	    if(write){
	      console.log(`Saldo foi zerado com sucesso!! ${user.id}`);
	    }
	}

};
