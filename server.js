const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const url = process.env.ATLAS_URI;
const socket = require('socket.io');
const swaggerUI = require('swagger-ui-express');

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
app.use('/api/upload', require('./router/upload-file'));
app.use('/api/group', require('./router/groupRouter'));
app.use('/api/groupMessage', require('./router/groupMessageRouter'));
const swaggerSpec = require('./swagger');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const hostName = "172.20.32.25";
const port = process.env.PORT || 8080;
const uri = process.env.ATLAS_URI;

const server = app.listen(port, hostName, () => {
  console.log(`Example app listening on: http://${hostName}:${port}/`);
});

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

const io = socket(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.1.8:8081'],
    credential: true,
  }
});
let isConnected = false;
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  isConnected = true;

  socket.on("disconnect", () => {
    isConnected = false;
  });

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
  //delete-msg
  socket.on("delete-msg", async (data) => {
    const { messageId } = data;
    io.emit("msg-delete", { messageId });
  });
  //recall-msg
  socket.on("recall-msg", async (data) => {
    const { messageId } = data;
    io.emit("msg-recall", { messageId });
  });
  //video call dùng socket và ZegoUIKitPrebuilt
  socket.on('initiate-call', (data) => {
    const { receiverId } = data;
    io.emit('call-initiated', { message: 'Cuộc gọi đã được khởi tạo' });
  });
  // group chat socket
  socket.on("join-room", (data) => {
    const { groupId } = data;
    socket.join(groupId);
  });
  socket.on("send-group-msg", (data) => {
    const { groupId, msg, from } = data;
    socket.to(groupId).emit("recieve-group-msg", { msg, from, groupId });
    //send notification to all users in the group
    socket.to(groupId).emit("group-msg-notification", { msg, from, groupId });
  });
  //delete-group-msg
  socket.on("delete-group-msg", async (data) => {
    const { messageId, groupId } = data;
    socket.to(groupId).emit("group-msg-delete", { messageId });
  });
  //recall-group-msg
  socket.on("recall-group-msg", async (data) => {
    const { messageId, groupId } = data;
    socket.to(groupId).emit("group-msg-recall", { messageId });
  });

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
});

module.exports = app;
