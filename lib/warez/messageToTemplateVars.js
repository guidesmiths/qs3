'use strict'

var debug = require('debug')('qs3:warez:messageToTemplateVars')
var format = require('util').format
var _ = require('lodash')

module.exports = messageToTemplateVars

function messageToTemplateVars(config, ctx, next) {
    next(null, function(message, content, cb) {

        debug('Running messageToTemplateVars middleware')

        var templateVars = {
            message: _.chain(message).omit('content').cloneDeep(message).value(),
            content: _.cloneDeep(content)
        }

        message.qs3 = message.qs3 || {}
        message.qs3.templateVars = message.qs3.templateVars || {}
        message.qs3.templateVars.message = templateVars.message
        message.qs3.templateVars.content = templateVars.content
        cb()
    })
}