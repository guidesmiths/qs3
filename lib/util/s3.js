var AWS = require('aws-sdk')

module.exports = {
    getClient: function(region) {
        AWS.config.update({ region: region })
        return new AWS.S3()
    }
}