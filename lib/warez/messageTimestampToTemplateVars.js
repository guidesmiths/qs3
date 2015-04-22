'use strict'

var debug = require('debug')('qs3:warez:messageTimestampToTemplateVars')
var format = require('util').format
var jsonpointer = require('jsonpointer')
var moment = require('moment')
var _ = require('lodash')

module.exports = messageTimestampToTemplateVars

function messageTimestampToTemplateVars(config, ctx, next) {

    next(null, function(message, content, cb) {

        debug('Running messageTimestampToTemplateVars middleware')

        message.qs3 = message.qs3 || {}
        message.qs3.templateVars = message.qs3.templateVars || {}

        getDate(message, config.source, function(err, date) {
            if (err) return cb(err)
            message.qs3.templateVars[config.destination] = dateFormat(date, config.template)
            cb()
        })
    })

    function getDate(obj, path, next) {
        var timestamp
        try {
            timestamp = jsonpointer.get(obj, path)
        } catch (err) {
            return _.isString(err) ? next(new Error(err)) : next(err)
        }
        return isTimestamp(timestamp) ? next(null, new Date(Number(timestamp)))
                                      : next(new Error(format('%s is not a valid timestamp', timestamp)))
    }

    function isTimestamp(str) {
        var n = Number(str);
        if (_.isNaN(n)) return false
        if (n % 1 != 0) return false
        return n >= 0
    }

    function dateFormat(date, template) {
        return moment(date.toISOString()).format(template)
    }

}