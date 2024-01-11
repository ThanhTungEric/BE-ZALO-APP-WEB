const express = require('express');
var app = express();

const routerUser = require('./router/userRouter');
const routerMessage = require('./router/messageRouter');

app.use('/user/', routerUser);
app.use('/message', routerMessage); 

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});