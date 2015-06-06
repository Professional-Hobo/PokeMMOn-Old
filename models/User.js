var Waterline = require('waterline');
var bcrypt = require('bcrypt-nodejs');

var User = Waterline.Collection.extend({

    identity: 'user',
    connection: 'connection',
    migrate: 'safe',

    attributes: {
        username: {
            type: 'string',
            unique: true
        },

        password: {
            type: 'string'
        },

        model: {
            type: 'string',
            defaultsTo: 'male_1'
        },

        zown: {
            type: 'string',
            defaultsTo: 'towny'
        },

        direction: {
            type: 'string',
            defaultsTo: 'down'
        },

        x: {
            type: 'integer',
            defaultsTo: 37
        },

        y: {
            type: 'integer',
            defaultsTo: 41
        },

        validPass: function(password) {
            return bcrypt.compareSync(password, this.password);
        }
    },

    beforeCreate: function(values, cb) {
        values.password = bcrypt.hashSync(values.password);
        cb();
    }
});

module.exports = User;
