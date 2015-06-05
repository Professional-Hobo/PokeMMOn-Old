var EventEmitter = require('events').EventEmitter,
    util         = require('util'),
//    Npc          = require('./Npc'),
    Player       = require('./Player');

util.inherits(Zone, EventEmitter);
exports = module.exports = Zone;

/*
 *  
 */
function Zone(name) {
    EventEmitter.call(this);            // Set up as an event emitter

    this.name = name;                   // TODO Make this a const if possible
    this.changedData = {};              // Contains the data to send to clients on update

    var map = [];                                                   // map that has walkable, non-walkable, and warp areas];           
    var mapping = require('../maps/' + name + '/mapping.json');     // Zone mappings (left, down, up, right);
    var players = {};                                               // All players on this map.

    // Initializes the map so that everything is walkable
    var dim = require('../maps/' + name + '/dim.json');             // The dimensions of this map
    for(var y = 0; y < dim.height; y++) {
        map[y] = [];
        for(var x = 0; x < dim.width; x++)
            map[y][x] = [{'type': 'walkable'}];
    }

    // Load in boundaries (non-walkable areas)
    require('../maps/' + name + '/boundaries.json').forEach(function(bound) {
        map[bound.y][bound.x][0].type = 'boundary';
    });

    // Load in warp zones
    require('../maps/' + name + '/warps.json').forEach(function(warp) {
        warp.type = "warp";
        map[warp.src_coords.y][warp.src_coords.x][0] = warp;
    });

    // Load in zone events
    require('../maps/' + name + '/events.json').forEach(function(zoneEvent) {
        zoneEvent.type = "event";
        map[zoneEvent.coords.y][zoneEvent.coords.x].push(zoneEvent);
    });

    // TODO Load in all NPCs
    //require('../maps' + name + '/NPCs.json').forEach(function(npc) {
        
    //});

}

Zone.prototype.update = function update() {
    Object.keys(players).forEach(function(key) {
        players[key].socket.emit('update', changedData);
    });
    this.changedData = {};       // Resets changedData
}

Zone.prototype.add = function add(player) {
    players[player.username] = player;
    player.socket.emit('update', {
        zone: {
            name: this.name,
            players: this.players,  // Might need to change this,
            zone: this.getPos.zone
        }
    });
}

function validateMove(player, dest) {
    //if(entity.x and entity.y => x and y is a legal move and x and y is walkable in the map) {
    return true;
}

Zone.prototype.move = function move(player, x, y, direction) {
    if(validateMove(player, {x: x, y: y})) {
        player.setPos(this.name, x, y, direction);
    } else {
        // Attempted an illegal move. Potential ban stuff here
        player.socket.emit('illegal', "What you tryin' ta do KID?!?!?!?");
    }

    changeData.players = this.players;  // Sends changed player data
}

