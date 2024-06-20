import server from './server';
import io from './socket_server';
io(server);


server.listen(process.env.PORT, () => {
    console.log('Server is running on port:', process.env.PORT);
});

export = server;