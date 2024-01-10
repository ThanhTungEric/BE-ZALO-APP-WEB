const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.dorlyyd.mongodb.net/BE_CHAT?retryWrites=true&w=majority';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    username: String,
    password: String,
},{
    collection: 'account'
});

const AccountModel = mongoose.model('account', AccountSchema);

module.exports = AccountModel;