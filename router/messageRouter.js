const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const Message = require('../models/message');
const routerMessage = express.Router();


process.env.AWS_SDK_IS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
const S3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const bucketName = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage({
    destination(req, file, callback) {
        callback(null, "")
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2000000 },
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    },
});

function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    return cb("Error: Pls upload images /jpeg|jpg|png|gif/ only!");
}

routerMessage.getMessage = async (req, res, next) => {
    try {
        const { from, to } = req.body;
        const messages = await Message.find({
            users: {
                $all: [from, to]
            },
        }).sort({ updatedAt: 1 });
        const projectedMessages = messages.map(message => {
            return {
                fromSelf: message.sender.toString() === from,
                message: message.message.text,
            };
        });
        res.json(projectedMessages);
    } catch (ex) {
        next(ex);
    }
};
routerMessage.postMessage = async (req, res, next) => {
    try {
        const { from, to, message } = req.body;
        const data = await Message.create({
            users: [from, to],
            sender: from,
            message: {
                text: message,
            },
        });
        if(data) res.json({ message: 'Message sent successfully' });
        else res.json({ message: 'Message not sent' });
    } catch (ex) {
        next(ex);
    }
};

module.exports = routerMessage;
