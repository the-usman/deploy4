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
    console.log('A user connected');

    socket.on('join', (userData) => {
        socket.join(userData.id);
        socket.emit('connected');
    });

    socket.on('typing', (room) => {
        socket.to(room).emit('isTyping', true);
    });

    socket.on('stop typing', (room) => {
        socket.to(room).emit('isTyping', false);
    });

    socket.on('new message', (newMessageRecieved) => {
        io.to(newMessageRecieved.room).emit('message received', newMessageRecieved);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

ConnectToDataBase();
