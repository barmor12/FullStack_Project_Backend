import {createServer} from 'http';
import {Server ,Socket} from 'socket.io';
import Client from 'socket.io-client';
import { AddressInfo } from 'net';

describe('Socket Server', () => {
    let io,serverSocket,clientSocket

    beforeAll((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const addr = httpServer.address() as AddressInfo;
            const port = addr.port;
            clientSocket = Client(`http://localhost:${port}`);
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);

    });
});

    afterAll(() => {
        io.close();
        clientSocket.close();
    });

    test('should work', (done) => {
        clientSocket.on('hello', (arg: any) => {
            expect(arg).toBe('world');
            done();
        });
        serverSocket.emit('hello', 'world');
    });

    test('should work (with ack)', (done) => {
        serverSocket.on('hi', (cb) => {
            cb("hola");
        });
        clientSocket.emit('hi', (arg: any) => {
            expect(arg).toBe("hola");
            done();
        });
    });


});