const express = require('express');
var bodyParser = require('body-parser');
const UserModel = require('../models/UserModel');
const routerUser = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

routerUser.use(bodyParser.urlencoded({ extended: false }));
routerUser.use(bodyParser.json());

routerUser.get('/', (req, res, next) => {
    UserModel.find({})
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            res.status(500).json('get user fail');
        })
});
routerUser.post('/', async (req, res, next) => {
    var password = await bcrypt.hash(req.body.password, 10);
    var fullName = req.body.fullName;
    var birthDate = req.body.birthDate;
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;
    var status = req.body.status;

    UserModel.findOne({ phoneNumber: phoneNumber })
        .then((account) => {
            if (account) {
                res.status(500).json('phonenumber already exists');
            }
            else {
                return UserModel.create({
                    password: password,
                    fullName: fullName,
                    birthDate: birthDate,
                    email: email,
                    phoneNumber: phoneNumber,
                    status: status,
                })
            }
        })
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });

});
//get user by id
routerUser.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});


//update user
routerUser.put('/phoneNumber/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const user = await UserModel.findOneAndUpdate({ phoneNumber: phoneNumber }, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ "message": "Không tìm thấy người dùng với số điện thoại này" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});

//delete user
routerUser.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ "can't find user with this id": id });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}
);

routerUser.post('/login', (req, res, next) => {
    var phoneNumber = req.body.phoneNumber;
    var password = req.body.password;

    UserModel.findOne({ phoneNumber: phoneNumber, password: password })
        .then((account) => {
            if (account) {
                res.json(account);
            }
            else {
                res.status(400).json('Account not found');
            }
        })
        .catch((err) => {
            res.status(500).json('login fail');
        })
});
// get usser by phone number
routerUser.get('/phoneNumber/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const user = await UserModel.findOne({ phoneNumber: phoneNumber });
        if (!user) {
            return res.status(404).json({ "can't find user with this phoneNumber": phoneNumber });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});

//send new password to email
routerUser.post('/forgotPassword', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ "can't find user with this email": email });
        }
        const newPassword = Math.random().toString(36).substring(2, 10);
        var password = await bcrypt.hash(newPassword, 10);
        await UserModel.findByIdAndUpdate(user._id, { password: password });
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'cotachat@gmail.com',
                pass: 's h j w i t j a s b l q a j i s'
            }
        });
        var mailOptions = {
            from: 'cotachat@gmail.com',
            to: email,
            subject: 'MẬT KHẨU MỚI CỦA BẠN',
            text: `Mật khẩu mới của bạn là: ${newPassword}. Hãy thay đổi mật khẩu ngay sau khi đăng nhập.`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'Email sent: ' + info.response });
            }
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}
);
// change password
routerUser.put('/changePassword/:id', async (req, res) => {
    try {
        const { id } = req.params;
        var lastpassword = req.body.lastpassword;
        var newpassword = req.body.newpassword;
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ "can't find user with this id": id });
        }
        const isPasswordValid = await bcrypt.compare(lastpassword, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ "password is incorrect": lastpassword });
        }
        var password = await bcrypt.hash(newpassword, 10);
        const updateUser = await UserModel
            .findByIdAndUpdate(id, {
                password: password
            });
        res.status(200).json(updateUser);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}
);
module.exports = routerUser;