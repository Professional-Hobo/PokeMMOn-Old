// Redis Session Store
var redis = require("redis")

var settings =  require('../../../settings.json');

// Waterline
var Waterline_init = require("../../../models/index");

// Instantiate a new instance of the ORM
var orm = Waterline_init.waterline;

// Build a config object
var config = Waterline_init.config;

var db = {};

db.sessionDB = redis.createClient();

// Initialize orm
orm.initialize(config, function(err, models) {
  if(err) throw err;

  db.models = models.collections;
  db.connections = models.connections;
});

module.exports = db;
