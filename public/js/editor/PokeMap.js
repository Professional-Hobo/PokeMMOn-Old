var PokeMap = function(tiles) {

  this.scale = 16;
  this.dim   = {
    width:  25,
    height: 25
  };

  this.map     = $('#map');
  this.ctx     = $('#map')[0].getContext('2d');

  if (tiles === undefined) {

    // Initialize
    this.tiles = new Array(this.dim.height);
    for (var i = 0; i < this.tiles.length; i++) {
        this.tiles[i] = new Array(this.dim.width);
    }

    // Populate
    for (var h = 0; h < this.dim.height; h++) {
      for (var w = 0; w < this.dim.width; w++) {

        // Create tile with default grass layer
        this.tiles[h][w] = new Tile([0,0],[0,0])
      }
    }
  } else {
    this.tiles = tiles;
  }

  this.dim.width = this.tiles[0].length;
  this.dim.height = this.tiles.length;

  // Set width and height
  this.ctx.canvas.width = this.dim.width * this.scale;
  this.ctx.canvas.height = this.dim.height * this.scale;

  this.render();

  // Disable right click menu
  $('#map')[0].oncontextmenu = function (e) {
    e.preventDefault();
  };
};

PokeMap.prototype = {

  // Clears a tile (canvas only)
  clearTile: function(x, y) {
    this.ctx.clearRect(x*this.scale, y*this.scale, 16, 16);
  },

  // Deletes a tile (data only)
  deleteTile: function(x, y) {
    this.tiles[x][y].clearLayers();
  },

  // Accepts a tile object
  drawTile: function(tile, x, y) {
    var self = this;

    // First clear the tile
    self.clearTile();

    // Draw from layer 1 to 3
    tile.getLayers().forEach(function(layer) {
      self.ctx.drawImage(tileset.image, layer[0]*self.scale, layer[1]*self.scale, self.scale, self.scale, x*self.scale, y*self.scale, self.scale, self.scale);
    });
  },

  // Defines what tile at x/y is
  setTile: function(tile, x, y) {
    var self = this;
    self.tiles[x][y].setLayers(tile);
    pokeworld.maps[map].tiles[x][y].setLayers(tile);
  },

  // Render specific tile
  renderTile: function(x, y) {
    this.drawTile(this.tiles[x][y], y, x);
  },

  // New map
  new: function(tileObject) {
    for (var h = 0; h < this.dim.height; h++) {
      for (var w = 0; w < this.dim.width; w++) {
        this.tiles[h][w] = new Tile(tileObject) || new Tile();
        pokeworld.maps[map].tiles[h][w] = new Tile(tileObject) || new Tile();
      }
    }
  },

  // Clear the canvas
  clear: function() {
    this.ctx.clearRect(0, 0, this.dim.width*this.scale, this.dim.height*this.scale);
  },

  // Renders the canvas using the tiles array
  render: function() {

    // Clear the canvas first
    this.clear();

    // Now draw all the tiles
    for (var h = 0; h < this.dim.height; h++) {
      //console.log("Rendering map: " + Math.ceil(h/this.dim.height*100) + "%");
      for (var w = 0; w < this.dim.width; w++) {
        this.drawTile(this.tiles[h][w], w, h);
      }
    }
  },

  // Resizes the map and updates the positions
  resize: function(direction, amount, tileObject) {
    var self = this;

    if (direction == "up" || direction == "down") {

      // Removing rows
      if (amount < 0) {
        amount = Math.abs(amount);

        // Make sure amount to remove is less than or equal to total rows in canvas
        // This prevents getting into the negatives
        amount = amount > this.dim.height ? this.dim.height : amount;
        for (var i = 0; i < amount; i++) {
          this.tiles[direction == "up" ? "shift" : "pop"]();
          pokeworld.maps[map].tiles[direction == "up" ? "shift" : "pop"]()
        }

        // Update height of pokemap object
        this.dim.height -= amount;
        pokeworld.maps[map].info.dimensions.height -= amount;

      // Adding rows
      } else if (amount > 0 && this.dim.height+amount <= 1024) {
        amount = Math.abs(amount);

        for (var i = 0; i < amount; i++) {
          // add pokemap-width number of new tiles.
          var toAdd = Array.apply(null, Array(Math.abs(this.dim.width))).map(function(x) {
            return new Tile([0, 0]);
          });
          this.tiles[direction == "up" ? "unshift" : "push"](toAdd.slice());
          pokeworld.maps[map].tiles[direction == "up" ? "unshift" : "push"](toAdd.slice());
        }

        // Update height of pokemap object
        this.dim.height += amount;
        pokeworld.maps[map].info.dimensions.height += amount;
      }

    } else if (direction == "right" || direction == "left") {

      // Removing cols
      if (amount < 0) {
        amount = Math.abs(amount);

        // Make sure amount to remove is less than or equal to total cols in canvas
        // This prevents getting into the negatives
        amount = amount > this.dim.width ? this.dim.width : amount;

        Object.keys(this.tiles).forEach(function(index) {
          for (var i = 0; i < amount; i++) {
            self.tiles[index][direction == "left" ? "shift" : "pop"]();
            pokeworld.maps[map].tiles[index][direction == "left" ? "shift" : "pop"]();
          }
        });

        // Update width of pokemap object
        this.dim.width -= amount;
        pokeworld.maps[map].info.dimensions.width -= amount;

      // Adding cols
      } else if (amount > 0 && this.dim.width+amount <= 1024) {
        amount = Math.abs(amount);

        Object.keys(this.tiles).forEach(function(index) {
          for (var i = 0; i < amount; i++) {
            self.tiles[index][direction == "left" ? "unshift" : "push"](new Tile([0, 0]));
            pokeworld.maps[map].tiles[index][direction == "left" ? "unshift" : "push"](new Tile([0, 0]));
          }
        });

        // Update width of pokemap object
        this.dim.width += amount;
        pokeworld.maps[map].info.dimensions.width += amount;
      }
    }

    // Update the attributes of the canvas tag
    this.map.attr("width", this.dim.width*this.scale);
    this.map.attr("height", this.dim.height*this.scale);

    // Render new resized map
    this.render();

    // Update dimensions viewer
    $("#dim").html("Current map dim: " + this.dim.width + "x" + this.dim.height);
  },

  // Generate random map with random tiles
  random: function() {

    for (var h = 0; h < this.dim.height; h++) {
      //console.log("Generating random map: " + Math.ceil(h/this.dim.height*100) + "%");
      for (var w = 0; w < this.dim.width; w++) {

        // Create tile with 2 random layers
        var tile = new Tile(
          [Math.floor((Math.random() * tileset.width/this.scale) + 1), Math.floor((Math.random() * tileset.height/this.scale) + 1)],
          [Math.floor((Math.random() * tileset.width/this.scale) + 1), Math.floor((Math.random() * tileset.height/this.scale) + 1)]
        );
        this.tiles[h][w] = tile;
        pokeworld.maps[map].tiles[h][w] = tile;
      }
    }
  },

  // Update canvas width/height attributes
  updateAttr: function() {
    this.map.attr("width", this.dim.width*this.scale);
    this.map.attr("height", this.dim.height*this.scale);
  }
};
