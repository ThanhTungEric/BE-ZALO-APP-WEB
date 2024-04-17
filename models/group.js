const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.ATLAS_URI;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const GroupSchema = new Schema({
    avatar: String,
    groupName: String,
    groupMembers: Array,
    groupAdmin: String,
    groupDeputy: Array,
    createdAt: Date,
    link: String,
}, {
    timestamps: true,
});
const Group = mongoose.model('group', GroupSchema);
module.exports = Group;