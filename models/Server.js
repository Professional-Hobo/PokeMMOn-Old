var Waterline = require('waterline');

var Server = Waterline.Collection.extend({

    identity: 'server',
    connection: 'connection',
    migrate: 'safe',

    attributes: {
        name: 'string',
        capacity: 'number'
    }
});

module.exports = Server;
