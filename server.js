const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const url = process.env.ATLAS_URI;
const socket = require('socket.io');

var app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());

const routerUser = require('./router/userRouter');



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/user/', routerUser);
app.use('/friend', require('./router/friendRouter'));
app.use('/api/messages', require('./router/apiMesage'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const port = process.env.PORT || 8080;
const uri = process.env.ATLAS_URI;

const server = app.listen(port, (req, res) => {
    console.log(`Example app listening on port: ${port}!`);
});

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

const io = socket(server,{
    cors: {
        origin: 'http://localhost:3000',
        credential: true,
    }
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
        
module.exports = app;
