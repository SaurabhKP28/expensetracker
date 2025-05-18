const AWS = require('aws-sdk');
require('dotenv').config();
const UserService = require('../services/userservices.js');

/*
const s3 = new AWS.S3({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  region: process.env.AWS_REGION,
});

exports.uploadToS3 = (data, filename) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read',
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3response) => {
      if (err) reject(err);
      else resolve(s3response.Location);
    });
  });
};
*/
const S3Service = require('../services/S3services');

module.exports = {
  uploadToS3: S3Service.uploadToS3
};

