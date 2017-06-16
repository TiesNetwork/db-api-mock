    var express = require('express');
var router = express.Router();
var db = require('../app/db/db');

/* POST db data. */
router.route('/:table').
    post(async function(req, res, next) {
        try {
            let json = req.body;
            let table = req.params.table;
            let result = await db.query_write(table, json);
            res.send('record added');
        }catch(e) {
            console.log(e.stack);
            res.send('Error: ' + e.message);
        }
    })
    .delete(async function(req, res, next) {
        try {
            let json = req.body;
            let table = req.params.table;
            let result = await db.query_delete(table, json);
            res.send('record deleted');
        }catch(e) {
            console.log(e.stack);
            res.send('Error: ' + e.message);
        }
    });

module.exports = router;
