
import { Server } from'socket.io';
import http from 'http';


export = (server: http.Server) => {
    const io = new Server(server);
    io.on('connection', (socket) => {
        console.log('a user connected' + socket.id);
        socket.onAny((eventName, args) => {
            console.log("on event:" + eventName)
            socket.emit('echo', args);
        })
    });
    return io;
}
    
    



