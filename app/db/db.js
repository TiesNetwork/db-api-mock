const cassandra = require('cassandra-driver');
let client;

var EC = require('@ties-network/db-sign');

function init(clientOptions){
	client = new cassandra.Client(clientOptions);
}

cassandra.init = init;

function checkName(name){
    if(!name)
        throw new Error('Invalid table/column name: ' + name);
    if(name.indexOf('"') >= 0)
        throw new Error('Invalid table/column name: ' + name);
}

cassandra.query_write = async function(table, json){
	if(!EC.checkMessage(json))
		throw new AnyBalance.Error('Message is not signed properly: ' + JSON.stringify(json));
    checkName(table);

	let result = await client.execute(`INSERT INTO "${table}" JSON '${JSON.stringify(json).replace(/'/g, "''")}'`);
	return result;
};

cassandra.query_delete = async function(table, json){
	if(!EC.checkMessage(json))
		throw new AnyBalance.Error('Message is not signed properly: ' + JSON.stringify(json));
    checkName(table);

    let where = [];
    let values = [];
    for(key in json){
        if(key == '__signature')
            continue;
        if(key == '__timestamp')
            continue;
        checkName(key);
        where.push(`"${key}"=?`);
        values.push(json[key]);
    }

	let result = await client.execute(`DELETE FROM "${table}" WHERE ${where.join(' AND ')}`, values);
	return result;
};

module.exports = cassandra;
