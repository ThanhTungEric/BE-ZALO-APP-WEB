const express = require('express');
var bodyParser = require('body-parser');
const UserModel = require('../models/UserModel');
const routerUser = express.Router();

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
routerUser.post('/', (req, res, next) => {
    var password = req.body.password;
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
routerUser.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findByIdAndUpdate(id, req.body);
        if (!user) {
            return res.status(404).json({ "can't find user with this id": id });
        }
        const updateProduct = await userModel.findById(id);
        res.status(200).json(updateProduct);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}
);
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
module.exports = routerUser;