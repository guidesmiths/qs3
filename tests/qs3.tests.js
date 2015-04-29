var format = require('util').format
var assert = require('assert')
var rascal = require('rascal')
var async = require('async')
var _ = require('lodash')
var path = require('path')
var crypto = require('crypto')
var ware = require('ware');
var s3 = require('../lib/util/s3')
var qs3 = require('..')
var config = require('./qs3.tests.json')

describe('qs3', function() {

    this.timeout(10000)
    this.slow(undefined)

    var region = 'eu-west-1'
    var bucket = 'qs3-tests'

    var broker

    beforeEach(function(done) {
        async.series([
            function(cb) {
                rascal.createBroker(rascal.withTestConfig(config.rascal), function(err, _broker) {
                    cb(err, broker = _broker)
                })
            },
            emptyBucket
        ], done)
    })

    afterEach(function(done) {
        broker ? broker.nuke(done) : done()
    })

    after(function(done) {
        emptyBucket(done)
    })

    it('should upload message content to s3 server', function(done) {

        var middleware = ware()
        var content = {
            text: crypto.pseudoRandomBytes(10).toString('hex')
        }

        broker.publish('p1', content, 'library.v1.book.978-3-16-148410-0.loan.created' , function(err, publication) {
            assert.ifError(err)

            broker.subscribe('s1', function(err, subscription) {
                subscription.on('message', function(message, content) {
                    middleware.run({}, message, content, function(err) {
                        assert.ifError(err)
                    })
                })
            })

            qs3.init(config.qs3.routes.book_loan_v1, {}, function(err, warez) {
                assert.ifError(err)
                _.each(warez, function(ware) {
                    middleware.use(ware)
                })
            })

            middleware.use(function(flowScope, message, content) {
                download(format('library/v1/book/978-3-16-148410-0/loan/created/%s.json', message.properties.messageId), function(err, uploadedContent) {
                    assert.ifError(err)
                    assert.equal(uploadedContent.text, content.text)
                    done()
                })
            })

        })
    })

    it('should incorporate timestamps into the uploaded filename', function(done) {

        var middleware = ware()
        var content = {
            text: crypto.pseudoRandomBytes(10).toString('hex')
        }

        broker.publish('p1', content, {
            routingKey: 'library.v2.book.978-3-16-148410-0.loan.created',
            options: {
                headers: {
                    timestamp: 1429550153167
                }
            }
        }, function(err, publication) {
            assert.ifError(err)

            broker.subscribe('s2', function(err, subscription) {
                subscription.on('message', function(message, content) {
                    middleware.run({}, message, content, function(err, message, content) {
                        assert.ifError(err)
                    })
                })
            })

            qs3.init(config.qs3.routes.book_loan_v2, {}, function(err, warez) {
                assert.ifError(err)
                _.each(warez, function(ware) {
                    middleware.use(ware)
                })
            })

            middleware.use(function(flowScope, message, content) {
                download(format('library/2015/04/20/%s.json', message.properties.messageId), function(err, uploadedContent) {
                    assert.ifError(err)
                    assert.equal(uploadedContent.text, content.text)
                    done()
                })
            })
        })
    })

    it('should incorporate content disposition into the uploaded filename', function(done) {

        var middleware = ware()
        var content = {
            text: crypto.pseudoRandomBytes(10).toString('hex')
        }

        broker.publish('p1', content, {
            routingKey: 'library.v3.book.978-3-16-148410-0.loan.created',
            options: {
                headers: {
                    contentDisposition: 'attachment; filename="978-3-16-148410-0.json"'
                }
            }
        }, function(err, publication) {
            assert.ifError(err)

            broker.subscribe('s3', function(err, subscription) {
                subscription.on('message', function(message, content) {
                    middleware.run({}, message, content, function(err, message, content) {
                        assert.ifError(err)
                    })
                })
            })

            qs3.init(config.qs3.routes.book_loan_v3, {}, function(err, warez) {
                assert.ifError(err)
                _.each(warez, function(ware) {
                    middleware.use(ware)
                })
            })

            middleware.use(function(flowControl, message, content) {
                download('library/978-3-16-148410-0.json', function(err, uploadedContent) {
                    assert.ifError(err)
                    assert.equal(uploadedContent.text, content.text)
                    done()
                })
            })

        })
    })

    function emptyBucket(next) {
        var s3Client = s3.getClient(region)
        s3Client.listObjects({
            Bucket: bucket,
            Prefix: 'library'
        }, function(err, res) {
            if (err) return next(err)
            async.each(res.Contents, function(obj, cb) {
                s3Client.deleteObject({
                    Bucket: bucket,
                    Key: obj.Key
                }, cb)
            }, next)
        })
    }

    function download(key, next) {
        s3.getClient('eu-west-1').getObject({
            Bucket: 'qs3-tests',
            Key: key,
        }, function(err, res) {
            if (err) return next(err)
            next(null, JSON.parse(res.Body.toString()))
        })
    }
})