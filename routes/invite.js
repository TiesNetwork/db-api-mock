/**
 * Created by Dukei on 15.07.2017.
 */
let express = require('express');
let router = express.Router();

let EC = require('@ties-network/db-sign');
let c = require('../app/Connection')
let config = require('../config')

/* POST db data. */
router.route('/redeem').
    post(async function(req, res, next) {
        let result;
        try {
            let json = req.body;
            let address = json.address;
            if(!/^0x[\da-f]{40}$/i.test(address))
                throw new Error('Invalid address');

            let status;
            let balance = await c.bc.web3.eth.getBalancePromise(address);
            if(json.code.toLowerCase() == 'getmyties' && balance.toNumber() == 0){
                //If the user is new - give it some money
                status = await c.bc.TieToken.transferAndPay(address, c.bc.web3.toWei(10, 'ether'), "0x", {value: c.bc.web3.toWei(0.15, 'ether')});
            }else {
                status = await c.bc.invitationRedeem(json.code, address);
            }

            result = {
                "ok": true,
                "status": status
            };
        }catch(e) {
            console.log(e.stack);
            result = {
                "ok": false,
                "error": typeof e == 'string' ? e : e.message
            };
        }

        res.send(JSON.stringify(result));
    })
;

module.exports = router;
