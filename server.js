const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let data = { available: [], teamA: [], teamB: [] };
const adminPassword = 'SHURY123';

app.use(express.static('public')); // Serve arquivos estáticos

io.on('connection', (socket) => {
    console.log('A user connected');

    // Envia o estado inicial
    socket.emit('state', data);

    socket.on('addNick', (nick) => {
        if (!data.available.find((n) => n.name === nick.name)) {
            data.available.push(nick);
            io.emit('state', data); // Atualiza todos os clientes
        }
    });
    
    socket.on('moveNick', ({ nick, from, to }) => {
        const sourceArea = data[from];
        const targetArea = data[to];
        if (!sourceArea || !targetArea) return;
    
        // Remove da área de origem
        const index = sourceArea.findIndex((n) => n.name === nick.name);
        if (index !== -1) {
            const [movedNick] = sourceArea.splice(index, 1);
            // Adiciona à área de destino
            targetArea.push(movedNick);
            io.emit('state', data); // Atualiza todos os clientes
        }
    });
    
    socket.on('clearAll', (password) => {
        if (password !== adminPassword) return;
        data = { available: [], teamA: [], teamB: [] };
        io.emit('state', data);
    });
    

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const port = process.env.PORT || 3000; // Porta fornecida pelo Render ou 3000 como fallback
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
