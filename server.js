const express = require('express');
var app = express();

const routerUser = require('./router/userRouter');
const routerMessage = require('./router/messageRouter');
const userModel = require('./models/UserModel');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



app.use('/user/', routerUser);
app.use('/message', routerMessage);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/test', (req, res) => {
    res.send('Hello Test!');
});

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});

//create user
app.use(express.json());
app.post('/user', async (req, res) => {
    try {
        const user = await UserModel.create(req.body);
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
    console.log(req.body);
    res.send(req.body);
});
//get user
app.get('/user', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});
//get user by id
app.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});

//update user
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findByIdAndUpdate(id, req.body);
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
app.delete('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findByIdAndDelete(id);
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


