const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const { onJoin, onSendMessage, onSendLocation, onDisconnect } = require('./utils/events.js');
const { getRooms } = require('./utils/rooms.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', socket => {
    console.log('New web socket connection');

    socket.on('join', (sentUserDetails, callback) => onJoin(io, socket, sentUserDetails, callback));
    socket.on('sendMessage', (message, callback) => onSendMessage(io, socket, message, callback));
    socket.on('sendLocation', (location, callback) => onSendLocation(io, socket, location, callback));
    socket.on('disconnect', () => onDisconnect(io, socket));
});

app.get('/rooms', (req, res) => {
    try {
        res.send(getRooms());
    } catch(e) {
        console.error(e);
        res.status(500).send();
    }
});

server.listen(port, () => {
    console.log(`Listening at port ${port}`);
});