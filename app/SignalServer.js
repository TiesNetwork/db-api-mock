function initSignalServer(io) {
    const signalServer = require('simple-signal-server')(io);
    const _ = require('lodash');

    let addressToSockets = {};
    let socketToAddress = {};

    io.on('connection', function (socket) {
        console.log('a user connected');
    });

    signalServer.on('request', function (data) {
        console.log('request', data);
        let address = data.receiver.id;
        let sockets = addressToSockets[address];
        if (!sockets) {
            console.log(`can not find target ${address}`);
            signalServer._sockets[data.initiator.id].emit('simple-signal[error]', {message: 'Can not find target ' + address});
        } else {
            data.forward(sockets[sockets.length - 1]);
        }
    });

    signalServer.on('discover', function (data) {
        console.log('discover', data);
        let meta = data.metadata;
        let address = meta.address;
        let socketid = data.id;
        if (!addressToSockets[address])
            addressToSockets[address] = [];
        addressToSockets[address].push(socketid);
        socketToAddress[socketid] = address;
        data.discover(meta);
    });

    signalServer.on('disconnect', function (socket) {
        console.log('disconnect', socket.id);
        let addr = socketToAddress[socket.id];
        if (addr) {
            delete socketToAddress[socket.id];
            _.pull(addressToSockets[addr], socket.id);
            if (addressToSockets[addr].length == 0)
                delete addressToSockets[addr];
        }
    });
}

module.exports = initSignalServer;