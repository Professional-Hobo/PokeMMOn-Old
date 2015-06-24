var PokeWorld = function() {
  // What the default PokeWorld with a default PokeMap looks like

  this.name = "World";

  this.info             = {};
  this.info.created     = Math.floor(new Date() / 1000);
  this.info.modified    = Math.floor(new Date() / 1000);
  this.info.author      = "User";
  this.info.description = "";

  this.maps =    {
    "default": {
      "info": {
        "creation_date": Math.floor(new Date() / 1000),
        "modification_date": Math.floor(new Date() / 1000),
        "description": "",
        "dimensions": {
          "width": 10,
          "height": 10
        }
      },
      "tiles": [],
      "npcs": [],
      "events": [],
      "warps": []
    }
  };


  this.map = this.maps["default"];   // Current map that is loaded
  this.dim = this.map.info.dimensions;

  this.map.tiles = new Array(this.dim.height);
  for (var i = 0; i < this.dim.width; i++) {
      this.map.tiles[i] = new Array();
  }

  this.populate(new Tile([0, 0]))

  this.history = [];
};

PokeWorld.prototype = {

  populate: function(tile) {
    tile = tile || new Tile([0, 0]);

    for (var h = 0; h < this.dim.height; h++) {
      for (var w = 0; w < this.dim.width; w++) {
        this.map.tiles[h][w] = tile;
      }
    }
  },

  export: function() {
    return {
      info: this.info,
      maps: this.maps
    }
  },

  load: function(worldData) {
    // What the default PokeWorld with a default PokeMap looks like

    this.name = worldName;   // Loads global world name

    this.info = world.info;  // Loads global world info

    this.maps = world.maps;  // Loads global world maps

    //this.map = this.maps[map];   // Load in specified map
    //this.dim = this.map.info.dimensions;

    this.history = [];
  }
};