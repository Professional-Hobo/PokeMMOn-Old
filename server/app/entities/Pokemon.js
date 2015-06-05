function Pokemon() {
    this.ID = ;                 // Same ID this will have in pokedex
    this.uniqueID = ;           // Unique ID. Used to differentiate between all pokemon in game
    this.trainer = ;            // If null, it is a wild pokemon
    this.level = ;
    this.stats = {
        'hp': ,
        'attack': ,
        'sp. attack': ,
        'defense': ,
        'sp. defense': ,
        'speed': 
    };
    this.HP = this.stats.hp;    // HP starts out equal to base HP
    this.happiness = ;
    this.friendliness = ;
    this.evolutions = {
        lvl: ID of evolution here
    };
};



exports = module.exports = new Pokemon();
