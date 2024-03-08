const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.dorlyyd.mongodb.net/BE_CHAT?retryWrites=true&w=majority';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    password: String,
    fullName: String,
    birthDate: String,
    email: String,
    phoneNumber: String,
    status: {
        type: String,
        default: 'online'
    }
}, {
    collection: 'user'
});
const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;