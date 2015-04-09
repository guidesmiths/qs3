/**
 * Created by Peter on 4/9/2015.
 */

var assert = require('assert');
var AWS = require('aws-sdk');


AWS.config.region = 'eu-west-1';


var s3bucket = new AWS.S3({ params: { Bucket: 'gs-test-field' } });

s3bucket.createBucket(function () {
    var params = { Key: 'myKey', Body: 'Hello!' };
    s3bucket.upload(params, function (err, data) {
        if (err) {
            console.log("Error uploading data: ", err);
        } else {
            console.log("Successfully uploaded data to myBucket/myKey");
        }
    });
});


//https://github.com/tes/service-payment-daily-export/blob/master/src/fileRepo.js