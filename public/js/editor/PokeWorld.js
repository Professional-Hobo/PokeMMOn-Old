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

  this.mouse = {
    down: false,
    right: false,
    x: 0,         // Clicked X
    y: 0,         // Clicked Y
    hover_x: 0,   // Currently hovering X
    hover_y: 0,   // Currently hovering Y
    prev_x: 0,    // Previous Xcoord of mouse for panning
    prev_y: 0     // Previous Ycoord of mouse for panning
  };

  this.previous  = {};    // Saves the previous state of the pokemap.tiles
  this.original  = {};
  this.history   = [];    // Sets up history for undo/redo
  this.updatePrevious();
  this.saveOriginal();
  this.undoIndex = 0;

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

    this.previous  = {};    // Saves the previous state of the pokemap.tiles
    this.original  = {};
    this.history   = [];    // Sets up history for undo/redo
    this.updatePrevious();
    this.saveOriginal();
    this.undoIndex = 0;
  },

  startListeners: function() {
    var self = this;

    // Shift on
    window.addEventListener('keydown', function(e) {
      if (e.shiftKey) {
        $("#map").css("cursor", "-webkit-grab");
        self.mouse.shift = true;
      }
    });

    // Shift off
    window.addEventListener('keyup', function(e) {
      console.log(e.shiftKey);
      if (!e.shiftKey) {
        $("#map").css("cursor", "pointer");
        self.mouse.shift = false;
      }
    });

    $('#map')[0].addEventListener('mousedown', function(e){
      self.mouse.down = true;

      if (self.mouse.shift) {
        $("#map").css("cursor", "-webkit-grabbing");

        self.mouse.prev_x = e.offsetX - self.pokemap.offset.x;
        self.mouse.prev_y = e.offsetY - self.pokemap.offset.y;
      } else {
        if (self.mouseDifferent()) {
          self.selectTile();
        }

        // Left click
        if (e.which == 1) {
          if (tileset.isTransparent(tileset.mouse.tileID)) {
            self.pokemap.setTile([tileset.mouse.tileID, tileset.background], self.mouse.tile_y, self.mouse.tile_x);
          } else {
            self.pokemap.setTile(tileset.mouse.tileID, self.mouse.tile_y, self.mouse.tile_x);
          }
        } else {
            self.mouse.right = true;
            self.pokemap.setTile(0, self.mouse.tile_y, self.mouse.tile_x);
        }
      }
    });

    $('#map')[0].addEventListener('mouseup', function(e){
      self.mouse.down = false;
      self.mouse.right = false;

      if (!self.mouse.shift) {
        $("#map").css("cursor", "pointer");
      } else {
        $("#map").css("cursor", "-webkit-grab");
      }

      self.saveState();
    });

    $('#map')[0].addEventListener('mousemove', function(e){

      self.mouse.x = e.offsetX - self.pokemap.offset.x;
      self.mouse.y = e.offsetY - self.pokemap.offset.y

      self.mouse.hover_x = Math.floor(self.mouse.x / 16);
      self.mouse.hover_y = Math.floor(self.mouse.y / 16);

      if (self.mouse.shift) {
        if (self.mouse.down) {
          $("#map").css("cursor", "-webkit-grabbing");
          // Record difference
          var x_diff = e.offsetX - self.pokemap.offset.x - self.mouse.prev_x;
          var y_diff = e.offsetY - self.pokemap.offset.y - self.mouse.prev_y;

            self.pokemap.offset.x += x_diff;
            self.pokemap.offset.y += y_diff;

            // Update
            self.mouse.prev_x = e.offsetX - self.pokemap.offset.x;
            self.mouse.prev_y = e.offsetY - self.pokemap.offset.y;

            self.pokemap.updatePlayerPosByOffset();
        }
      } else {

        if (self.mouse.down && self.mouseDifferent()) {
          self.selectTile();

          // Left click (drag)
          if (e.which == 1) {
            if (tileset.isTransparent(tileset.mouse.tileID)) {
              self.pokemap.setTile([tileset.mouse.tileID, tileset.background], self.mouse.tile_y, self.mouse.tile_x);
            } else {
              self.pokemap.setTile(tileset.mouse.tileID, self.mouse.tile_y, self.mouse.tile_x);
            }
          } else {
              self.mouse.right = true;
              self.pokemap.setTile(0, self.mouse.tile_y, self.mouse.tile_x);
          }

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
  },

  // Pushes a jsondiffpatch to the history array
  saveState: function() {
    return;
    var current = _.cloneDeep(this.pokemap.tiles);

    // If resuming from the middle of the history, this'll delete the states
    // that were saved past this point and update the undoIndex to point to
    // the most recent.
    if (this.undoIndex != 0) {
      this.history = this.history.slice(this.undoIndex);

      // We need to make this.previous equal all of the changes up to undo index
      this.undoIndex = 0;

    }

    this.history.push(jsondiffpatch.reverse(jsondiffpatch.diff(this.previous, current)));

    this.updatePrevious();   // Update previous with current state
  },

  // "Undos" by restoring to previous state
  undoState: function() {
    var stateToRestore = this.history.length - 1 - this.undoIndex;
    if (stateToRestore in this.history) {
      jsondiffpatch.patch(this.pokemap.tiles, this.history[stateToRestore]);
      this.pokemap.render();
      this.undoIndex++;   // Update undo index;
    } else {
      throw "END_OF_HISTORY";
    }
  },

  // "Redos" by restoring to preceeding state from undoIndex
  redoState: function() {
    var stateToRestore = this.history.length - this.undoIndex;
    if (stateToRestore in this.history) {
      jsondiffpatch.patch(this.pokemap.tiles, jsondiffpatch.reverse(this.history[stateToRestore]));
      this.pokemap.render();
      this.undoIndex--;   // Update undo index;
    } else {
      throw "START_OF_HISTORY";
    }
  },

  updatePrevious: function() {
    this.previous = _.cloneDeep(this.pokemap.tiles);
  },

  saveOriginal: function() {
    this.original = _.cloneDeep(this.pokemap.tiles);
  }
};
