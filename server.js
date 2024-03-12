const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

var app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());

const routerUser = require('./router/userRouter');
const routerMessage = require('./router/messageRouter');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
 
app.use('/user/', routerUser);
app.use('/message', routerMessage); 

const port = process.env.PORT || 8080;
const uri = process.env.ATLAS_URI;

app.listen(port, (req, res) => {
    console.log(`Example app listening on port: ${port}!`);
});

mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));