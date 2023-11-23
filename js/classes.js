//Transactions
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
			throw new Error('No hay firma en esta transacción');
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

//Blocks
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

  function createGraphicalBlock(block){
	deleteEnd();
	const timestamp = document.createElement('div');
	timestamp.classList.add('timerline-header');
	const timestampText = document.createElement('span');
	timestampText.classList.add('tag', 'is-info');
	timestampText.innerHTML = block.timestamp;
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
	const blockHeader = document.createElement('p');
	blockHeader.classList.add('heading');
	blockHeader.innerHTML = `Block #${block.hash}`;
	const blockData = document.createElement('p');
	if (!block.transactions[0].from || !block.transactions[0].to || !block.transactions[0].amount)
	{
	  blockData.innerHTML = `Block <b>#${block.hash}</b> has no transactions`;
	}
	else
	{
	  blockData.innerHTML = `<b>#${block.transactions[0].from}</b> sent <b>${block.transactions[0].amount}</b> to <b>#${block.transactions[0].to}</b>`;
	}
	blockContent.appendChild(blockHeader);
	blockContent.appendChild(blockData);
	blockDiv.appendChild(blockContent);
	document.getElementById('chain').appendChild(timestamp);
	document.getElementById('chain').appendChild(blockDiv);
	createEnd();
  }

  //function that creates a div that floats above a block and displays the data of the block
  /*function showData(block){
	let dataCard = document.createElement('div');
	dataCard.classList.add('card');
	const cardcontent = document.createElement('div');
	cardcontent.classList.add('card-content');
	const content = document.createElement('div');
	content.classList.add('content');
	//Contenido del Block
	const title = document.createElement('h5');
	title.innerHTML = `Block #${block.index}`;
	const timestamp = document.createElement('p');
	timestamp.innerHTML = `Timestamp: ${block.timestamp}`;
	var data = document.createElement('p');
	data.innerHTML = `Data: ${block.data}`;
	const hash = document.createElement('p');
	hash.innerHTML = `Hash: ${block.hash}`;
	content.appendChild(title);
	content.appendChild(timestamp);
	content.appendChild(data);
	content.appendChild(hash);

	cardcontent.appendChild(content);
	dataCard.appendChild(cardcontent);
	block.appendChild(data);
  }*/

//Blockchain
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
			throw new Error('La transacción no tiene una dirección de origen o destino');
		}
		if(!transaction.isValid()){
			throw new Error('La transacción no es válida');
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
