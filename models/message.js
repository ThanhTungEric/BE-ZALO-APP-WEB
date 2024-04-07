const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.ATLAS_URI;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  message: {
    text: { type: String, required: true },
  },
  users: Array,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
},
  {
    timestamps: true,
  });

const MessageModel = mongoose.model('message', MessageSchema);
module.exports = MessageModel;
