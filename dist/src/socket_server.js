"use strict";
const socket_io_1 = require("socket.io");
module.exports = (server) => {
    const io = new socket_io_1.Server(server);
    io.on('connection', (socket) => {
        console.log('a user connected' + socket.id);
        socket.onAny((eventName, args) => {
            console.log("on event:" + eventName);
            socket.emit('echo', args);
        });
    });
    return io;
};
//# sourceMappingURL=socket_server.js.map