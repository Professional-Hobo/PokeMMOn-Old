var PokeWorld = function() {
  var self = this;
  // What the default PokeWorld with a default PokeMap looks like
  this.name = null;
  this.grid = 16;

  // Info template
  this.info             = {};
  this.info.created     = Math.floor(new Date() / 1000);
  this.info.modified    = Math.floor(new Date() / 1000);
  this.info.author      = "User";
  this.info.description = "";
  this.info.npcs        = [];
  this.info.event       = [];
  this.info.warps       = [];

  // Empty map template with default map
  this.maps = {
    "default": {
      "info": {
        "creation_date": Math.floor(new Date() / 1000),
        "modification_date": Math.floor(new Date() / 1000),
        "description": "",
        "dimensions": {
          "width": 25,
          "height": 25
        }
      },
      "tiles": []
    }
  };

  map = "default"   // Global var contains current map name

  // Allocate space for the map tiles
  this.maps[map].tiles = new Array(this.maps[map].info.dimensions.height);
  for (var i = 0; i < this.maps[map].info.dimensions.width; i++) {
    this.maps[map].tiles[i] = new Array();
  }

  this.populate(0)   // Populate map tiles with grass

  this.pokemap   = new PokeMap($.extend(true, [], this.maps[map].tiles));  // Send in the map tiles to pokemap

  this.mouse    = {tile_x: 0, tile_y: 0, down: false, right: false};

  this.history   = [];   // Sets up history for undo/redo

  this.startListeners();
};

PokeWorld.prototype = {

  // Fill a map with specified tile
  populate: function(tile) {

    for (var h = 0; h < this.maps[map].info.dimensions.height; h++) {
      for (var w = 0; w < this.maps[map].info.dimensions.width; w++) {
        this.maps[map].tiles[h][w] = new Tile(tile) || new Tile(0);
      }
    }
  },

  // Outputs the parts of the map we want to save
  export: function() {
    var self = this;
    return ({
      info: self.info,
      maps: self.maps
    });
  },

  load: function(worldData) {
    // What the default PokeWorld with a default PokeMap looks like

    this.name = worldName;   // Loads global world name

    this.info = worldData.info;  // Loads global world info

    this.maps = worldData.maps;  // Loads global world maps

    map = Object.keys(pokeworld.maps)[0];   // Load in first map

    this.history = [];
  },

  startListeners: function() {
    var self = this;
    $('#map')[0].addEventListener('mousedown', function(e){
      self.mouse.down = true;

      if (self.mouseDifferent()) {
        self.selectTile();
      }

      // Left click
      if (e.which == 1) {
        self.pokemap.setTile(tileset.mouse.tile_y*16 + tileset.mouse.tile_x, self.mouse.tile_y, self.mouse.tile_x);
        self.pokemap.renderTile(self.mouse.tile_y, self.mouse.tile_x);
      } else {
          self.mouse.right = true;
          self.pokemap.setTile(0, self.mouse.tile_y, self.mouse.tile_x);
          self.pokemap.renderTile(self.mouse.tile_y, self.mouse.tile_x);
      }

    });

    $('#map')[0].addEventListener('mouseup', function(e){
      self.mouse.down = false;
      self.mouse.right = false;
    });

    $('#map')[0].addEventListener('mousemove', function(e){
      self.mouse.x = e.offsetX;
      self.mouse.y = e.offsetY;

      self.mouse.hover_x = Math.floor(self.mouse.x/(self.grid));
      self.mouse.hover_y = Math.floor(self.mouse.y/(self.grid));

      if (self.mouse.down && self.mouseDifferent()) {
        self.selectTile();

        // Left click
        if (e.which == 1) {
          self.pokemap.setTile(tileset.mouse.tile_y*16 + tileset.mouse.tile_x, self.mouse.tile_y, self.mouse.tile_x);
          self.pokemap.renderTile(self.mouse.tile_y, self.mouse.tile_x);
        } else {
            self.mouse.right = true;
            self.pokemap.setTile(0, self.mouse.tile_y, self.mouse.tile_x);
            self.pokemap.renderTile(self.mouse.tile_y, self.mouse.tile_x);
        }

      }
    });

    $('#map')[0].addEventListener('mouseleave', function(e){
      self.mouse.down = false;
      self.mouse.right = false;
    });
  },

  selectTile: function(x, y) {
    if (x === undefined) {
      var x = this.mouse.x;
      var y = this.mouse.y;
    } else {
      var x = x * 16;
      var y = y * 16;
    }

    this.mouse.tile_x = Math.floor(x/(this.grid));
    this.mouse.tile_y = Math.floor(y/(this.grid));
  },

  mouseDifferent: function() {
    var self = this;

    if (Math.floor(self.mouse.x/(self.grid)) != self.mouse.tile_x || (Math.floor(self.mouse.y/(self.grid)) != self.mouse.tile_y)) {
      return true;
    }
    return false;
  }
};
