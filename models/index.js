var Waterline = require('waterline');
var settings = require('../settings.json');
var adapter = require(settings.db.adapter);

var fs = require('fs');
var path = require("path");

var orm = new Waterline();

var Config = {
  adapters: {
    default: adapter
  },

  connections: {
    connection: {
      adapter:  'default',
      host:     settings.db.host,
      port:     settings.db.port,
      user:     settings.db.user,
      password: settings.db.password,
      database: settings.db.database
    }
  },

  defaults: {
    migrate: 'alter'
  }

};

// Load in all models
console.log("\nLoading models...");
var a = 0;
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = require(path.join(__dirname, file));
    console.log("#" + ++a + ". Loaded model " + file.slice(0, -3));
    orm.loadCollection(model);
  });

console.log("\n" + a + " models loaded successfully!");

module.exports = {waterline: orm, config: Config};
