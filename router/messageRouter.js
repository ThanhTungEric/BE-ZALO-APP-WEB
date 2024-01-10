const express = require('express');
const routerMessage = express.Router();

routerMessage.get('/', (req, res) => {
    res.json({ message: 'test message' });
});

module.exports = routerMessage;