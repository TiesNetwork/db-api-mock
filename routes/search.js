/**
 * Created by Dukei on 15.07.2017.
 */
let express = require('express');
let router = express.Router();

let EC = require('@ties-network/db-sign');
let config = require('../config');
let rp = require('request-promise-native');

/* POST db data. */
router.route('/:table').
    post(async function(req, res, next) {
        let result;
        try {
            let json = req.body;
            if(!EC.checkMessage(json))
                throw new Error('Invalid signature');
            if(!json.query)
                throw new Error('Query not specified!');

            let table = req.params.table;

            let uri = `http://localhost:9200/${config.connection.keyspace}/${table}/_search`;
            console.log(uri);

            let res = await rp({
                method: 'POST',
                body: {query: json.query},
                uri: uri,
                json: true // Automatically parses the JSON string in the response
            });

            result = {
                "ok": true,
                "result": res
            }
        }catch(e) {
            console.log(e.stack);
            result = {
                "ok": false,
                "error": e.message
            };
        }

        res.send(JSON.stringify(result));
    })
;

module.exports = router;
