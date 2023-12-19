class Transaction{
  constructor(from, to, amount){
	this.from = from;
	this.to = to;
	this.amount = amount;
	this.signTransaction();
  }

	calculateHash(){
	  return sha256(this.from + this.to + this.amount,{asString:false});
	}

   async signTransaction(){
	  let hash = this.calculateHash();
	  this.signature = hash;
	  const hashArray = new Uint8Array(hash);
	  this.signature = await window.crypto.subtle.sign(
			  "RSASSA-PKCS1-v1_5",
			  window.keyPairPrivado,
			  hashArray
	  );
	}

	async isValid(){
		if(this.from === null) return true;

		if(!this.signature || this.signature.length === 0){
			throw new Error('This transaction has no signature');
		}
		const hashArray = new Uint8Array(this.signature);
		const data = new Uint8Array(this);
		let verified = await window.crypto.subtle.verify(
			"RSASSA-PKCS1-v1_5",
			window.keyPairPublico,
			hashArray,
			data);
		return verified;
	}
}

class Block{
	constructor(timestamp, transactions, previousHash = ''){
	  this.timestamp = timestamp;
	  this.transactions = transactions;
	  this.previousHash = previousHash;
	  this.hash = this.calculateHash();
	  this.nonce = 0;
	}

	calculateHash(){
	   return sha256(
		this.previousHash +
		this.timestamp +
		JSON.stringify(this.data) +
		this.nonce,{asString:false}
		);
	}

	mine(difficulty){
	  /*Se compara el hash con un array de 0 de la misma longitud que el difficulty,
	  POW de Bitcoin*/
	  while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
		this.nonce++;
		this.hash = this.calculateHash();
	  }
	}

	isValidBlock(){
		for(const transaction of this.transactions){
			if(!transaction.isValid()){
				return false;
			}
		}
		return true;
	}
  }

  function createEnd(){
	const end = document.createElement('div');
	end.classList.add('timeline-header');
	const endText = document.createElement('span');
	endText.classList.add('tag', 'is-primary');
	endText.innerHTML = 'End';
	end.appendChild(endText);
	document.getElementById('chain').appendChild(end);
  }

  function deleteEnd(){
	const end = document.getElementById('chain').lastChild;
	end.parentNode.removeChild(end);
  }

  function convertTimestamp(timestamp){
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = date.getMonth()+1;
	const day = date.getDate();
	const hour = date.getHours();
	const min = date.getMinutes();
	const sec = date.getSeconds();
	const time = `${day}/${month}/${year} ${hour}:${min}:${sec}`;
	return time;
  }

  function createGraphicalBlock(block){
	deleteEnd();
	const timestamp = document.createElement('div');
	timestamp.classList.add('timerline-header');
	const timestampText = document.createElement('span');
	timestampText.classList.add('tag', 'is-info');
	timestampText.innerHTML = convertTimestamp(block.timestamp);
	timestamp.appendChild(timestampText);
	const blockDiv = document.createElement('div');
	blockDiv.classList.add('timeline-item');
	const blockMarker = document.createElement('div');
	blockMarker.classList.add('timeline-marker');
	blockMarker.classList.add('is-icon');
	blockMarker.classList.add('is-success', 'is-large');
	const svgString = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" viewBox=\"0 0 448 512\"><path d=\"M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z\"/></svg>";
	const container = document.createElement('div');
	container.innerHTML = svgString;
	const blockIcon = container.firstChild;
	blockMarker.appendChild(blockIcon);
	blockMarker.appendChild(blockIcon);
	blockDiv.appendChild(blockMarker);
	const blockContent = document.createElement('div');
	blockContent.classList.add('timeline-content');
	const blockCard = document.createElement('div');
	blockCard.classList.add('card');
	const cardContent = document.createElement('div');
	cardContent.classList.add('card-content');
	const cardContentInner = document.createElement('div');
	cardContentInner.classList.add('content');
	const blockTime = document.createElement('time');
	blockTime.setAttribute('datetime', convertTimestamp(block.timestamp));
	blockTime.innerHTML = convertTimestamp(block.timestamp);
	cardContentInner.appendChild(blockTime);
	if (typeof(block.transactions) === 'string')
	{
		if (!block.transactions[0].to || !block.transactions[0].amount)
		{
			cardContentInner.innerHTML += `<br>Block <b>#${block.hash}</b> has no transactions`;
		}
		else
		{
			cardContentInner.innerHTML += `<br><b>#${block.transactions[0].from}</b> sent <b>${block.transactions[0].amount}</b> to <b>#${block.transactions[0].to}</b>`;
		}
	}
	else if (typeof(block.transactions) === 'object')
	{
		if (!block.transactions[0].to || !block.transactions[0].amount)
		{
			cardContentInner.innerHTML += `<br>Block <b>#${block.hash}</b> has no transactions`;
		}
		else
		{
			cardContentInner.innerHTML += `<br><b>#${block.transactions[0].from}</b> sent <b>${block.transactions[0].amount}</b> to <b>#${block.transactions[0].to}</b>`;
		}
		for (let i = 1; i < block.transactions.length; i++)
		{
			if (!block.transactions[i].to || !block.transactions[i].amount)
			{
				cardContentInner.innerHTML += `<br>Block <b>#${block.hash}</b> has no transactions`;
			}
			else
			{
				cardContentInner.innerHTML += `<br><br><b>#${block.transactions[i].from}</b> sent <b>${block.transactions[i].amount}</b> to <b>#${block.transactions[i].to}</b>`;
			}
		}
	}
	cardContent.appendChild(cardContentInner);
	blockCard.appendChild(cardContent);
	blockContent.appendChild(blockCard);
	blockDiv.appendChild(blockContent);
	document.getElementById('chain').appendChild(timestamp);
	document.getElementById('chain').appendChild(blockDiv);
	createEnd();
  }

class Blockchain{
	constructor(){
	  this.chain = [this.createGenesisBlock()];
	  this.difficulty = 2;
	  this.waitingTransactions = [];
	  this.reward = 100;
	  createGraphicalBlock(this.chain[0]);
	}

	createGenesisBlock(){
	  return new Block(Date.now(), "Genesis Block", "0");
	}

	getLatestBlock(){
	  return this.chain[this.chain.length - 1];
	}

	mineAwaitingTransactions(rewardAddress){
		const block = new Block(Date.now(), this.waitingTransactions, this.getLatestBlock().hash);
		block.mine(this.difficulty);
		this.chain.push(block);

		this.waitingTransactions = [
		  new Transaction(null, rewardAddress, this.reward)
		];
	}

	createTransaction(transaction){
		if(!transaction.from || !transaction.to){
			throw new Error('Transaction must include from and to address');
		}
		if(!transaction.isValid()){
			throw new Error('Transaction must be valid');
		}
	  this.waitingTransactions.push(transaction);
	}

	getBalanceOfAddress(address){
	  let balance = 0;
	  for(const block of this.chain){
		for(const transaction of block.transactions){
		  if(transaction.from === address){
			balance -= transaction.amount;
		  }
		  if(transaction.to === address){
			balance += transaction.amount;
		  }
		}
	  }
	  return balance;
	}

	isChainValid(){
	  Array.prototype.forEach.call(chain, (block, index) => {
		const previousBlock = chain[index - 1];

		if(!block.isValidBlock()){
			return false;
		}

		if(block.hash !== block.calculateHash()){
		  return false;
		}

		if(block.previousHash !== previousBlock.hash){
		  return false;
		}
	  });
	  return true;
	}
}
