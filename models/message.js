const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.dorlyyd.mongodb.net/BE_CHAT?retryWrites=true&w=majority';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const MessageSchema = new Schema({
    senderId: String,
    message: String,
    time: String,
    isRead: String
},{
    collection: 'message'
});

const MessageModel = mongoose.model('message', MessageSchema);

module.exports = MessageModel;