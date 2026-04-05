const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: [
            "http://127.0.0.1:5500", 
            "https://chatapp-online-sebs-solutions.netlify.app" // ¡Tu nueva URL de Netlify!
        ],
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const PORT = process.env.PORT || 3000;

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta básica para la pagina principal del chat
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = {}; // Objeto para almacenar los usuarios conectados

// Escucha los eventos de conexión de los clientes
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado'); // Muestra un mensaje cuando un usuario se conecta

    // Maneja el evento 'join' para añadir un nuevo usuario
    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
        io.emit('userJoined', username);
    });

    // Manejar la desconexión de un usuario
    socket.on('disconnect', () => {
        const username = users[socket.id]
        if(username){
            delete users[socket.id];
            io.emit('userList', Object.values(users));
            io.emit('userLeft', username);
        }
        console.log('Usuario desconectado'); // Muestra un mensaje cuando un usuario se desconecta
    });

    // Escucha el evento 'message' del cliente
    socket.on('message', (msg) => {
        io.emit('chatMessage', msg); // Retransmite el mensaje a todos los clientes conectados
    })
});

// Iniciar el servidor en el puerto especificado
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});