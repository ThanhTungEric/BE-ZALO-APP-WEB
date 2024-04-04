const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.ATLAS_URI;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    password: {
        type: String,
        required: true,
        min: 8,
    },
    fullName: {
        type: String,
        required: true,
        min: 1,
        max: 60
    },
    birthDate: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(v); // Kiểm tra xem chuỗi có đúng định dạng email không
            },
            message: props => `${props.value} không phải là một email hợp lệ!`
        },
        unique: true
    },
    avatar: {
        type: String,
        default: 'https://avatarchatapp.s3.ap-southeast-1.amazonaws.com/download.png'
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v); // Kiểm tra xem chuỗi có đúng 10 ký tự số không
            },
            message: props => `${props.value} không phải là một số điện thoại hợp lệ!`
        }
    },
    status: {
        type: String,
        default: 'online'
    }
}, {
    collection: 'user'
});
const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;