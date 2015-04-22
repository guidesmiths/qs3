'use strict'

var debug = require('debug')('qs3:warez:messageToS3id')
var format = require('util').format
var _ = require('lodash')
var template = require('../util/template')


module.exports = messageToS3id

function messageToS3id(config, ctx, next) {

    template.compile(config.template, function(err, render) {

        if (err) return next(err)

        next(null, function(message, content, cb) {

            debug('Running messageToS3id middleware')

            message.qs3 = message.qs3 || {}

            debug(format('Rendering s3id with template: %s', config.template))

            render(message.qs3.templateVars, function(err, s3id) {
                if (err) return cb(err)
                debug(format('Setting s3id to: %s', s3id))
                message.qs3.s3id = s3id
                cb()
            })
        })
    })
}