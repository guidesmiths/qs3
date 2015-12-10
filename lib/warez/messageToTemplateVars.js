'use strict'

var debug = require('debug')('qs3:warez:messageToTemplateVars')
var _ = require('lodash')

module.exports = messageToTemplateVars

function messageToTemplateVars(config, ctx, next) {
    next(null, function(flowScope, message, content, cb) {

        debug('Running messageToTemplateVars middleware')

        var templateVars = {
            message: _.chain(message).omit('content').cloneDeep(message).value(),
            content: _.cloneDeep(content)
        }

        flowScope.qs3 = flowScope.qs3 || {}
        flowScope.qs3.templateVars = flowScope.qs3.templateVars || {}
        flowScope.qs3.templateVars.message = templateVars.message
        flowScope.qs3.templateVars.content = templateVars.content
        cb()
    })
}