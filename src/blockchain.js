const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

    class Transaction{
        constructor(fromAddress, toAddress, amount){
            this.fromAddress = fromAddress;
            this.toAddress = toAddress;
            this.amount = amount;
        }
        //hash of our trans
        calculateHash(){
            return SHA256(this.fromAddress + this.toAddress + this.amount).toString();

        }
        signTransaction(signingKey){
            if(signingKey.getPublic('hex') !== this.fromAddress){
                throw new Error('You cannot sign transactions for other wallets!');
            }

            const hashTx = this.calculateHash();
            const sig = signingKey.sign(hashTx, 'base64');
            this.signature = sig.toDER('hex');
        }

        isValid(){
            if(this.fromAddress === null) return true;

            if(!this.signature || this.signature.length === 0){
                throw new Error('No signature in this transaction');

            }
            const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
            return publicKey.verify(this.calculateHash(), this.signature);
        }
    }
    class Block{
    //index option going to tell us where block sits on the chain update been remove format,
    //the timestamp will tell us when the block was created
    //data this might include any type of data that you want to associate update change to transaction
    //the previous hash is a string that contains the hash of block before 
    //this one very important it ensures the integrity of our blockchain so I'am going to keep track
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    
/*calculate the hash function of this block 
so it's going to take the properties of this block run
through them hash function and then return the hash this will identify*/
    calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
//exactly length of zero
    mineBlock(difficulty)   {
    while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")){
        this.nonce++;
        this.hash=this.calculateHash();
    
        }
    console.log("Block mined: " + this.hash);
    }
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}
    

    
    class Blockchain{
    //insitalize our blockchain
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions =[];
        this.miningReward = 100;
    }
    createGenesisBlock(){
        return new Block(Date.parse("04/25/2021"), [], "0");
    }
    //retrun the lasetest block
    getLatestBlock(){
        return this.chain[this.chain.length -1];

    }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            //new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }
    
    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error ('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);//this might be an issue
    }

    getBalancedOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress == address){
                    balance -= trans.amount;
                }

                if(trans.toAddress == address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    
    isChainValid(){
    for(let i=1; i< this.chain.length; i++){
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i-1];

        if(!currentBlock.hasValidTransactions()){
            return false;
        }
        
        if(currentBlock.hash !== currentBlock.calculateHash()){
            return false;
        }
        if(currentBlock.previousHash !== previousBlock.hash){
            return false;
        }
    }

    return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction; 