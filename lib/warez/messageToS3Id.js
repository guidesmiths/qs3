'use strict'

var debug = require('debug')('qs3:warez:messageToS3id')
var _ = require('lodash')
var template = require('../util/template')


module.exports = messageToS3id

function messageToS3id(config, ctx, next) {

    template.compile(config.template, function(err, render) {

        if (err) return next(err)

        next(null, function(flowScope, message, content, cb) {

            debug('Running messageToS3id middleware')

            flowScope.qs3 = flowScope.qs3 || {}

            debug('Rendering s3id with template: %s', config.template)

            render(flowScope.qs3.templateVars, function(err, s3id) {
                if (err) return cb(err)
                debug('Setting s3id to: %s', s3id)
                flowScope.qs3.s3id = s3id
                cb()
            })
        })
    })
}