'use strict'

var debug = require('debug')('qs3:index')
var format = require('util').format
var _ = require('lodash')
var async = require('async')
var url = require('url')
var warez = require('./lib/warez')
var configure = require('./lib/config/configure')

module.exports = {
    init: init,
    warez: warez
}

function init(config, ctx, next) {
    if (arguments.length === 2) return init(config, {}, arguments[2])
    ctx.warez = _.defaults(ctx.warez || {}, warez)

    configure(config, function(err, routeConfig) {
        if (err) return next(err)
        async.mapSeries(routeConfig.sequence, function(id, callback) {
            var warezConfig = routeConfig.warez[id]
            ctx.warez[warezConfig.type](warezConfig.options || {}, ctx, callback)
        }, next)
    })
}