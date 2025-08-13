const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let todos = [];

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send(JSON.stringify({ type: 'todosUpdate', todos }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'add') {
            todos.push(data.todo);
            console.log(`✅ Todo Added: ${data.todo}`);
        }

        if (data.type === 'delete') {
            todos = todos.filter((_, i) => i !== data.index);
            console.log(`❌ Todo Deleted at index: ${data.index}`);
        }

        // Sab clients ko updated list bhej do
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'todosUpdate', todos }));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});