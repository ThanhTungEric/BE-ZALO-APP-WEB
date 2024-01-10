const express = require('express');
var bodyParser = require('body-parser');
const AcccountModel = require('../models/account');
const routerUser = express.Router();

routerUser.use(bodyParser.urlencoded({ extended: false }));
routerUser.use(bodyParser.json());

routerUser.get('/', (req, res) => {
    res.json({ message: 'test' });
});

routerUser.post('/register', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    AcccountModel.findOne({ username: username })
        .then((account) => {
            if (account) {
                res.status(500).json('username already exists');
            }
            else {
                return AcccountModel.create({
                    username: username,
                    password: password
                })
            }
        })
        .then(() => {
            res.json('register success');
        })
        .catch((err) => {
            res.status(500).json('register fail');
        })
});

routerUser.post('/login', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    AcccountModel.findOne({ username: username, password: password })
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