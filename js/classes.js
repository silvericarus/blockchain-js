//TODO Arreglar classes.js para que funcione correctamente
//Take keys from localstorage
let keyPairPub = localStorage.getItem('keyPairPublico');
let keyPairPriv = localStorage.getItem('keyPairPrivado');
//Transactions
class Transaction{
  constructor(from, to, amount){
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.signature = this.signTransaction(keyPairPriv);
  }

    calculateHash(){
      return sha256(this.from + this.to + this.amount,{asString:false});
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.from){
            //TODO Cambiar el mensaje del error
            throw new Error('You cannot sign transactions for other wallets!');
        }
            const hash = this.calculateHash();
            const sig = SubtleCrypto.sign(
                "RSASSA-PKCS1-v1_5",
                signingKey,
                hash
            ).then(function (){
                return sig;
            });
    }

    isValid(){
        if(this.from === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No hay firma en esta transacción');
        }

        return SubtleCrypto.verify(
            "RSASSA-PKCS1-v1_5",
            keyPairPub,
            this.signature);
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
       return sha256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce,{asString:false});
    }
  
    mine(difficulty){
      //Se compara el hash con un array de 0 de la misma longitud que el difficulty, POW de Bitcoin
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
  
  function createGraphicalBlock(block){
    var blockG = document.createElement('div');
    blockG.id = 'block'+block.hash;
    blockG.classList.add('accordion-item','bg-white','border','border-gray-200');
    var heading = document.createElement("h2");
    heading.classList.add('accordion-header','mb-0');
    heading.id = block.hash;
    var btn = document.createElement('button');
    btn.classList.add('accordion-button' ,
        'relative' ,
        'flex' ,
        'items-center' ,
        'w-full' ,
        'py-4' ,
        'px-5' ,
        'text-base','text-gray-800','text-left',
        'bg-white' ,
        'border-0' ,
        'rounded-none' ,
        'transition' ,
        'focus:outline-none');
    btn.type = 'button';
    btn.dataset.toggle = "collapse";
    btn.dataset.target = "#col"+ block.hash;
    btn.innerText = block.id;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', block.hash);
    heading.appendChild(btn);
    var content = document.createElement('div');
    content.id = block.hash;
    content.classList.add('accordion-collapse','collapse','show');
    content.setAttribute('aria-labelledby', block.hash);
    content.dataset.parent = 'block'+block.hash;
    var body = document.createElement('div');
    body.classList.add('accordion-body','py-4','px-5')
    var h2 = document.createElement('h2');
    h2.innerHTML = block.hash;
    var paragraph = document.createElement('p');
    paragraph.innerHTML = block.data;
    body.appendChild(h2)
        .appendChild(paragraph);
    content.appendChild(body);
    blockG.appendChild(heading)
        .appendChild(body);
    const container = document.getElementById('accordionExample');
    container.appendChild(blockG);
  }
  
  //function that creates a div that floats above a block and displays the data of the block
  function showData(block){
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
  }

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
        //this.colorBlocks();
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
