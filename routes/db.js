let express = require('express');
let router = express.Router();

const c = require('../app/Connection');
let db = c.db;

/* POST db data. */
router.route('/:table').
    post(async function(req, res, next) {
        let result;
        try {
            let json = req.body;
            let table = req.params.table;
            let res = await db.query_write(table, json);
            result = {
                "ok": true,
                "result": res
            };
        }catch(e) {
            console.log(e.stack);
            result = {
                "ok": false,
                "error": e.message
            };
        }
        res.send(JSON.stringify(result));
    })
    .delete(async function(req, res, next) {
        let result;
        try {
            let json = req.body;
            let table = req.params.table;
            let res = await db.query_delete(table, json);
            result = {
                "ok": true,
                "result": res
            };
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
