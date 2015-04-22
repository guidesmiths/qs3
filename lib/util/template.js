var debug = require('debug')('httq:util:template')
var format = require('util').format

var hogan = require('hogan.js')

module.exports = (function() {

    return {
        compile: compile,
        render: render
    }

    function compile(source, next) {
        debug(format('Compiling hogan template from source: %s', source))
        var template
        try {
            template = hogan.compile(source)
        } catch (err) {
            return next(err)
        }
        next(null, render.bind(null, template))
    }

    function render(template, data, next) {
        var document
        try {
            document = template.render(data)
        } catch (err) {
            return next(err)
        }
        next(null, document)
    }
})()
