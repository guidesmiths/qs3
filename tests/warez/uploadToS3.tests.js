var format = require('util').format
var assert = require('assert')
var _ = require('lodash')
var async = require('async')
var rascal = require('rascal')
var crypto = require('crypto')
var s3 = require('../../lib/util/s3')
var uploadToS3 = require('../..').warez.uploadToS3

describe('uploadToS3', function() {

    this.timeout(10000)
    this.slow(undefined)

    var broker
    var middleware
    var qs3 = {}
    var config = {
        bucket: 'qs3-tests',
        region: 'eu-west-1'
    }

    it('should fail to initialise when s3 region is not specified', function(done) {
        uploadToS3({}, {}, function(err, middleware) {
            assert.ok(err)
            assert.equal(err.message, 'An S3 region is required')
            done()
        })
    })

    it('should fail to initialise when s3 bucket is not specified', function(done) {
        uploadToS3({
            region: 'eu-west-1'
        }, {}, function(err, middleware) {
            assert.ok(err)
            assert.equal(err.message, 'An S3 bucket is required')
            done()
        })
    })

    it('should report an unrecoverable error when s3id is not specified', function(done) {

        var message = {
            properties: {
                headers: {
                }
            },
            qs3: {
            }
        }

        uploadToS3(config, {}, function(err, middleware) {
            assert.ifError(err)
            middleware(message, 'content', function(err) {
                assert.ok(err)
                assert.equal(err.message, 'An s3 id is required')
                assert.ok(!err.recoverable)
                done()
            })
        })
    })

    it('should report a recoverable error when the message cannot be uploaded', function(done) {

        var message = {
            properties: {
                headers: {
                }
            },
            qs3: {
                s3id: getS3Id(this.test)
            }
        }

        uploadToS3({
            bucket: 'does-not-exist',
            region: 'eu-west-1'
        }, {}, function(err, middleware) {
            assert.ifError(err)
            middleware(message, 'content', function(err) {
                assert.ok(err)
                assert.equal(err.message, 'The specified bucket does not exist')
                assert.ok(err.recoverable)
                done()
            })
        })
    })

    it('should upload message to s3', function(done) {
        var message = {
            properties: {
                headers: {
                    contentDisposition: 'attachment; filename=foo.txt'
                },
                contentType: 'text/plain'
            },
            qs3: {
                s3id: getS3Id(this.test)
            }
        }

        var content = crypto.pseudoRandomBytes(10).toString('hex')

        uploadToS3(config, message, function(err, middleware) {
            assert.ifError(err)
            middleware(message, content, function(err) {
                assert.ifError(err)
                s3.getClient(config.region).getObject({
                    Bucket: config.bucket,
                    Key: message.qs3.s3id
                }, function(err, res) {
                    assert.ifError(err)
                    assert.equal(res.ContentDisposition, 'attachment; filename=foo.txt')
                    assert.equal(res.ContentType, 'text/plain')
                    assert.equal(res.Body.toString(), content)
                    done()
                })
            })
        })
    })

    function getS3Id(test) {
        return test.title.replace(/ /g, '-') + '.txt'
    }
})