const ConnectToDataBase = require('./db');
const express = require('express');
const userRoutes = require('./Routes/userRouter');
const chatRouter = require('./Routes/chat');
const message = require('./Routes/message');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
const port = 5000;
app.use(cors());

app.use('/api/user/', userRoutes);

app.use('/api/chat/', chatRouter);
app.use('/api/message/', message);

const __dirname1 = path.resolve();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    app.use(express.static(path.resolve(__dirname1, 'front-end', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, 'front-end', 'build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

const server = app.listen(port, () => {
    console.log('Your app is listening at http://localhost:5000');
});

const io = require('socket.io')(server, {
    cors: {
        origin: 'https://chatwav.vercel.app', 
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
        console.log(userData._id);
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => io.in(room).emit('typing'));
    socket.on('stop typing', (room) => io.in(room).emit('stop typing'));

    socket.on('new message', (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.user) return console.log('chat.users not defined');

        chat.user.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            io.to(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.on('typing', (room) => io.in(room).emit('typing'));
    socket.on('stop typing', (room) => io.in(room).emit('stop typing'));
    socket.off('setup', () => {
        console.log('USER DISCONNECTED');
        socket.leave(userData._id);
    });
});

ConnectToDataBase();
