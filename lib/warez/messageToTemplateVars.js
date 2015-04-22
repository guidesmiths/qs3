'use strict'

var debug = require('debug')('qs3:warez:messageToTemplateVars')
var format = require('util').format
var _ = require('lodash')

module.exports = messageToTemplateVars

function messageToTemplateVars(config, ctx, next) {
    next(null, function(message, content, cb) {

        debug('Running messageToTemplateVars middleware')

        message.qs3 = message.qs3 || {}
        message.qs3.templateVars = message.qs3.templateVars || {}
        message.qs3.templateVars.message = _.cloneDeep(message)
        message.qs3.templateVars.content = _.cloneDeep(content)
        cb()
    })
}