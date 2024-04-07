const express = require('express');
const uploadRouter =  express.Router();
const bodyParser = require('body-parser');

uploadRouter.use(bodyParser.urlencoded({ extended: false }));
uploadRouter.use(bodyParser.json());
///UPFILE
const AWS = require("aws-sdk");
const path = require("path");
const multer = require('multer');
require("dotenv").config();

process.env.AWS_SDK_IS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
})

const S3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
});

const upload = multer({
    storage,
    limits: {fileSize: 2000000},
    fileFilter(req, file, cb){
        checkFileType(file, cb);
    }
});
function checkFileType(file, cb){
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if(extname && mimetype){
        return cb(null, true);
    }
    return cb(" Loi upload file, chi chap nhan jpg png gif");
};

uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const params = {
            Bucket: bucketName,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };
        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            res.status(200).send(data);
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = uploadRouter;