const{Blockchain,Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('7ee1b00016e246c3594f97f76d20cd1b1da18bb60c8ba93513f1835a338828aa');
const myWalletAddress = myKey.getPublic('hex');

//test if the code works
let milordCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
milordCoin.addTransaction(tx1);

/*milordCoin.createTransaction(new Transaction('address1', 'address2', 100));
milordCoin.createTransaction(new Transaction('address2', 'address1',50));
*/
console.log('\n Starting the miner...');
milordCoin.minePendingTransactions(myWalletAddress);


console.log('\nBalance of xavier is', milordCoin.getBalancedOfAddress(myWalletAddress));

milordCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain vaild?', milordCoin.isChainValid());

/*console.log('\n Starting the miner...');
milordCoin.minePendingTransactions('xaviers-address');

console.log('\nBalance of xavier is', milordCoin.getBalancedOfAddress('xaviers-address'));
*/