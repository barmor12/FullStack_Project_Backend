"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
describe('Socket Server', () => {
    let io, serverSocket, clientSocket;
    beforeAll((done) => {
        const httpServer = (0, http_1.createServer)();
        io = new socket_io_1.Server(httpServer);
        httpServer.listen(() => {
            const addr = httpServer.address();
            const port = addr.port;
            clientSocket = (0, socket_io_client_1.default)(`http://localhost:${port}`);
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
        clientSocket.on('hello', (arg) => {
            expect(arg).toBe('world');
            done();
        });
        serverSocket.emit('hello', 'world');
    });
    test('should work (with ack)', (done) => {
        serverSocket.on('hi', (cb) => {
            cb("hola");
        });
        clientSocket.emit('hi', (arg) => {
            expect(arg).toBe("hola");
            done();
        });
    });
});
//# sourceMappingURL=socket.test.js.map