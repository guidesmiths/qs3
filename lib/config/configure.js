'use strict'

var debug = require('debug')('httq:config:configure')
var format = require('util').format
var _ = require('lodash')

module.exports = function(config, next) {
    config.warez = config.warez || {}
    _.each(config.sequence, function(name) {
        config.warez[name] = _.chain(config.warez[name] || {}).cloneDeep().defaults({ type: name } ).value()
    })
    next(null, config)
}