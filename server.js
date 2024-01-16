const express = require('express');
var app = express();

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

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});