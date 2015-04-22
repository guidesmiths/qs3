'use strict'

var debug = require('debug')('qs3:warez:currentTimeToTemplateVars')
var format = require('util').format
var moment = require('moment')

module.exports = currentTimeToTemplateVars

function currentTimeToTemplateVars(config, ctx, next) {

    next(null, function(message, content, cb) {

        debug('Running currentTimeToTemplateVars middleware')

        message.qs3 = message.qs3 || {}
        message.qs3.templateVars = message.qs3.templateVars || {}

        var value = moment().format(config.template)
        debug(format('setting template variable: %s to value: %s', config.destination, value))
        message.qs3.templateVars[config.destination] = value
        cb()
    })
}