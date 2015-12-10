'use strict'

var debug = require('debug')('qs3:warez:uploadToS3')
var async = require('async')
var _ = require('lodash')
var path = require('path')
var s3 = require('../util/s3')

module.exports = uploadToS3

function uploadToS3(config, ctx, next) {

    if (!config.region) return next(new Error('An S3 region is required'))
    if (!config.bucket) return next(new Error('An S3 bucket is required'))

    var s3Client = s3.getClient(config.region)

    next(null, function(flowScope, message, content, cb) {

        debug('Running uploadHeadersToS3 middleware')

        var done = _.once(cb)

        if (!flowScope.qs3.hasOwnProperty('s3id')) return cb(new Error('An s3 id is required'))

        debug('Uploading %d bytes to bucket: %s and key: %s', message.content.length, config.bucket, flowScope.qs3.s3id)

        s3Client.putObject({
            Bucket: config.bucket,
            Key: flowScope.qs3.s3id,
            Body: JSON.stringify(_.omit(message, 'content'), null, 2),
            ContentDisposition: 'application/json',
            ContentType: 'application/json'
        }, function(err) {
            err ? done(recoverable(err)) : done()
        }).on('error', function(err) {
            debug('Error uploading message to bucket: %s and key: %s', config.bucket, flowScope.qs3.s3id)
            done(recoverable(err))
        })
    })
}

function recoverable(err) {
    err.recoverable = true
    return err
}