var Waterline = require('waterline');

var Server = Waterline.Collection.extend({

  identity: 'server',
  connection: 'connection',

  attributes: {
    name: 'string',
    capacity: 'number'
  }
});

module.exports = Server;