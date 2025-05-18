const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  region: process.env.AWS_REGION,
});

const uploadToS3 = (data, filename) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read',
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3response) => {
      if (err) {
        console.log('Something went wrong', err);
        reject(err);
      } else {
        resolve(s3response.Location);
      }
    });
  });
};

module.exports = { uploadToS3 };