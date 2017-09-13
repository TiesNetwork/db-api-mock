const config = require('../config');

//Connect to database
let connection = null;

const sign = require('ethjs-signer').sign;
const SignerProvider = require('ethjs-provider-signer');

const provider = new SignerProvider(config.blockchain.host, {
    signTransaction: (rawTx, cb) => {
        connection.bc.web3.eth.estimateGas(rawTx, (error, result) => {
            if(error) {
                cb(error.message || error);
            }else{
                rawTx.gas = result;
                cb(null, sign(rawTx, config.blockchain.signer_secret));
            }
        })
    },
    accounts: (cb) => cb(null, [config.blockchain.signer_address]),
});

class Connection {
    constructor(){
        if(connection)
            throw new Error('Only one connection should be created!');
        connection = this;

        const BlockChain = require('@ties-network/db-sign').BlockChain;

        this.db = require('./db/db');
        this.bc = new BlockChain(provider);

        this.waitingForConnect = this.connect();
        this.waitingForConnect.then(() => {
            console.log("Connected to BlockChain");
            this.bc.web3.eth.defaultAccount = config.blockchain.signer_address;
        }).catch(e => {
            console.error("Error connecting to blockchain: " + e.message);
            console.error(e.stack);
        });
    }

    async connect(){
        let ps1 = this.db.init({
            contactPoints: [config.connection.address],
            protocolOptions: { port: config.connection.port },
            keyspace: config.connection.keyspace,
            queryOptions: {consistency: this.db.types.consistencies.one},
            authProvider: new this.db.auth.PlainTextAuthProvider(config.connection.login, config.connection.password)
        });

        let ps2 = this.bc.connect();

        await Promise.all([ps1, ps2]);
    }


}

module.exports = new Connection();