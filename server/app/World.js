var db           = require('./util/db'),
    EventEmitter = require('events').EventEmitter,
    util         = require('util'),
    fs           = require('fs'),
    merge        = require('merge');

var Player, Zone, events, open, update, updateData = "{";

/*
 * Initializes the World so that it's ready to be started.
 * Only needs to be called once and the server can be
 * be shutdown and then started over and over again.
 */
exports.init = function init() {
    Player = require('./entities/Player'),
    Zone   = require('./entities/Zone');
    events = new EventEmitter();
}

/*
 * The heart of the game backend. Contains the world representation and performs
 * all operations on the world. Will handle settings up multiple channels when 
 * channel support is added in.
 */
exports.start = function start() { 
    open = true;
    players = {};
    zones = {};
    playerData = null;

    // Load all zones automatically from the maps directory

    // Have each zone push updates ~3 times a second
    /*update = setInterval(function() {
        Object.keys(zones).forEach(function(key) {
            zones[key].update();
        });
    }, 333);
    */

    update = setInterval(function() {
        Object.keys(players).forEach(function(key) {
            updateData += "\"" + key + "\": " + JSON.stringify(merge(players[key].pos, {model: players[key].model})) + ", ";
            //updateData += "\"" + key + "\": " + JSON.stringify(players[key].pos) + ", ";
        });
        playerData = updateData.slice(0, updateData.length-2) + "}";
        // Emit all of the data to clients

        Object.keys(players).forEach(function(key) {
            players[key].socket.emit('update', playerData);
        });
        updateData = "{";
    }, 1000/30);
};

/*
 * EventEmitter for the World
 */
exports.e = function getEmitter() {
    return events;
};

/*
 * Starting Zone information for new players
 */
exports.startZone = require('./newGame');

/*
 * Utility function to get a zone object
 */
exports.getZone = function getZone(name) {
    return zones[name];
}

/*
 * Private Helper function. Used by the saveAll and unloadPlayer functions
 * to remove redundant player save code
 */
function save(name) {
    var player = players[name];
    var pos = player.getPos();

    db.models.user.update({username: name}, {
        model: player.model,
        zone: pos.zone,
        x: pos.x,
        y: pos.y,
        direction: pos.direction
    }, function(err, user) {
       if(err) console.log("Error saving user: " + name + " to the DB!"); 
    });
}

exports.save = save;

/*
 * Saves the state of each player on the server. Good to call every hour or
 * so in case of a server crash.
 */
exports.saveAll = function saveAll() {
    Object.keys(players).forEach(function(player) {
        save(player);
    });
}

/*
 * Stops loading in players, saves all current player states, and then
 * unloads all players from the game.
 */
exports.shutdown = function shutdown() {
    open = false;
    clearInterval(update);

    Object.keys(players).forEach(function(player) {
        exports.unloadPlayer(player);
    });
}

/*
 * Called whenever a player logs in to the game. Add player to global array of logged in players.
 * 
 * @username The username of the player to be loaded in
 */
exports.loadPlayer = function loadPlayer(username, socket, callback) {
    if(!players[username] && open) {

        db.models.user.findOne({username: username}, function(err, user) {
            var options = {
                'socket': socket,
                'username': username,
                'walking': false
            };

            if(user.model)
                options.model = user.model;
            if(user.zone)
                options.pos = Player.prototype.genPos(user.zone, user.direction, user.x, user.y);
            var newPlayer = new Player(options);

            // Send loaded player data through callback
            callback(newPlayer);
        });
    }
}

/*
 * Called whenever a player logs out/leaves the game. Saves player data to the server and 
 * remove player from players array
 *
 * @username The username of the player to be unloaded
 */
exports.unloadPlayer = function unloadPlayer(username, callback) {
    save(username);
    delete players[username];

    if(typeof callback == "function")
        callback();
}

