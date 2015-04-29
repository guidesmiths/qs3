'use strict'

var debug = require('debug')('qs3:warez:routingKeyToPath')
var format = require('util').format
var _ = require('lodash')
var template = require('../util/template')


module.exports = routingKeyToPath

function routingKeyToPath(config, ctx, next) {

    next(null, function(flowScope, message, content, cb) {

        debug('Running routingKeyToPath middleware')
        flowScope.qs3 = flowScope.qs3 || {}
        flowScope.qs3.templateVars = flowScope.qs3.templateVars || {}
        flowScope.qs3.templateVars.path = message.fields.routingKey.replace(/\./g, '/')
        debug('Setting path to %s', flowScope.qs3.templateVars.path)
        cb()
    })
}