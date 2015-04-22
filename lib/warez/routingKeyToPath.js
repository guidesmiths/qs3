'use strict'

var debug = require('debug')('qs3:warez:routingKeyToPath')
var format = require('util').format
var _ = require('lodash')
var template = require('../util/template')


module.exports = routingKeyToPath

function routingKeyToPath(config, ctx, next) {

    next(null, function(message, content, cb) {

        debug('Running routingKeyToPath middleware')
        message.qs3 = message.qs3 || {}
        message.qs3.templateVars = message.qs3.templateVars || {}
        message.qs3.templateVars.path = message.fields.routingKey.replace(/\./g, '/')
        debug('Setting path to %s', message.qs3.templateVars.path)
        cb()
    })
}