const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clients = [];
let user_ids = 0;

const broadcast = (data, exclude) => {
    clients.forEach(client => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

wss.on('connection', ws => {
    user_ids += 1;
    ws.id = user_ids;
    clients.push(ws);

    ws.on('message', message => {
        const data = JSON.parse(message);
        let msg_content = {};

        if (data.login) {
            ws.username = data.username;
            msg_content = {
                type: 'login',
                message: `${data.username} has joined`,
                online: clients.map(client => client.username)
            };
            ws.send(JSON.stringify({ online: clients.map(client => client.username) }));
        } else if (data.body) {
            msg_content = {
                type: 'chat',
                message: data.body,
                online: clients.map(client => client.username)
            };
        }

        broadcast(msg_content, ws);
    });

    ws.on('close', () => {
        clients = clients.filter(client => client.id !== ws.id);
        const msg_content = {
            type: 'logout',
            message: `${ws.username} has disconnected`,
            online: clients.map(client => client.username)
        };
        broadcast(msg_content, ws);
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

const PORT = 8090;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
