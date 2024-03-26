const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.ATLAS_URI;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const FriendSchema = new Schema({
    idUser1: String,
    idUser2: String,
    status: Number,
    actionUserId: String
},{
    timestamps: true,   
});

const Friend = mongoose.model('friend', FriendSchema);
module.exports = Friend;