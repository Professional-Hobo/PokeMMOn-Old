// Redis Session Store
var redis    = require("redis")
var User     = require("../../../models/User.js")
var Server   = require("../../../models/Server.js")
var settings = require('../../../settings.json');
var conn     = require('../../../models/db.js');
var settings =  require('../../../settings.json');

var db = {};

db.sessionDB = redis.createClient();
db.models = {
  user: User,
  server: Server
};

module.exports = db;
