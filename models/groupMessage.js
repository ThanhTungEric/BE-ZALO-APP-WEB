const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.ATLAS_URI;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const GroupMessageSchema = new Schema({
    message: {
        text: { type: String, required: true },
    },
    users: Array,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
},
    {
        timestamps: true,
    });

const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);
module.exports = GroupMessage;
