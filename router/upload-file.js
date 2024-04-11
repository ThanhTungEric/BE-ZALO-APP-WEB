const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const shortId = require('shortid');
const AWS = require('aws-sdk');

require('dotenv').config();

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, shortId.generate() + '-' + file.originalname);
    },
  }),
});
module.exports = { upload };

router.post('/file', upload.single('file'), (req, res) => {
  res.json(req.file.location);
});
router.get('/download', async (req, res, next) => {
  var fileKey = req.query['fileKey'];
  var s3 = new AWS.S3({});
  var options = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
  };
  s3.getObject(options, function (err, data) {
    res.attachment(file);
    res.send(data.Body);
  });
});


module.exports = router;
