var /*Card =      require('./Card');
    Inventory = require('./Inventory'),
    Pc =        require('./Pc'),
    Pokedex =   require('./Pokedex'),
    Pokenav =   require('./Pokenav'),
    Settings =  require('./settings'),*/
    world =     require('../World');

/*
 * Utility function for areas where Player objects are created.
 */
function genPos(zone, direction, x, y) {
    return {
        zone: zone,
        direction: direction,
        x: x,
        y: y
    };
}

/*
 * fallback settings for a Player object to have
 */
var fallback = {
    model: "male_1",
    pos: genPos(world.startZone.zone, world.startZone.direction, world.startZone.x, world.startZone.y)
    /*
    inventory: new Inventory(),    
    party: [],              
    PC: new PC(),                
    pokedex: new Pokedex(),
    pokenav: new Pokenav(),
    card: new Card(),  
    settings: new Settings()
    */
};

//exports = module.exports = new Player(username, gender, zone, x, y, inventory, party, PC, pokedex, pokenav, card, settings);
exports = module.exports = Player;

/*
 * Each player in the game is represented with a player object.
 *
 * @options An object containing all the various options necessary for a Player object
 *      - username field is required
 */
function Player(options) {
        if(options.socket)
            this.socket = options.socket;
        else
            throw new Error('A socket is required to create a player!');

        if(options.username)
            this.username = options.username;       // Player display name. Unique identifier
        else
            throw new Error('Username is required to create a player!');

        this.model = options.model ? options.model : fallback.model;
        this.pos = options.pos ? options.pos : fallback.pos;             // Player positional data within the world

/*
        this.inventory = options.inventory ? options.inventory : fallback.inventory; // Player inventory
        
        // Pokemon player is currently carrying. Current limit is 6.
        this.party = new Party(options.party ? options.party : fallback.party);  

        // Player's PC. Where all there not in use items and pokemon go.
        this.PC = new PC(options.PC ? options.PC : fallback.PC);                 
        
        this.pokedex = new Pokedex(options.pokedex ? options.pokedex : fallback.pokedex);
        this.pokenav = new Pokenav(options.pokenav ? options.pokenav : fallback.pokenav);

        // Trainer Card - Used to keep track of player gym badges
        this.card = new Card(options.card ? options.card : fallback.card);

        // Options editable by player such as text speed, battle scene options, sound, etc.
        this.settings = options.settings ? options.settings : fallback.settings;


    world.getZone(pos.zone).add(this);          // Add this player to the zone it is in.

    // ---------- Player events ----------//
    socket.on('move', function(data) {
        world.getZone(pos.zone).move(this, data.x, data.y, data.direction);
    });
*/
}

Player.prototype.socket = function() {
    return this.socket;
};

Player.prototype.genPos = genPos;
/*
 * Utility function for areas where Player objects are created.
 */
Player.prototype.setPos = function setPos(zone, x, y, direction) {
    this.pos.zone = zone;
    this.pos.x = x;
    this.pos.y = y;
    this.pos.direction = direction;
};

Player.prototype.getPos = function getPos() {
    return this.pos;
}

