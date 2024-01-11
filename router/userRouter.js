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
    var userName = req.body.userName;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var birthDate = req.body.birthDate;
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;

    UserModel.findOne({ userName: userName })
        .then((account) => {
            if (account) {
                res.status(500).json('username already exists');
            }
            else {
                return UserModel.create({
                    userName: userName,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    birthDate: birthDate,
                    email: email,
                    phoneNumber: phoneNumber
                })
            }
        })
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).json('register fail');
        })
});

routerUser.post('/login', (req, res, next) => {
    var userName = req.body.userName;
    var password = req.body.password;

    UserModel.findOne({ userName: userName, password: password })
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