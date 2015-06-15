var PokeMap = function() {
  var self = this;

  this.scale   = 16;
  this.tile    = [0, 0];
  this.width   = 128;
  this.height  = 128;
  this.img     = new Image();
  this.img.src = "/img/editor/2_column_tileset.png";

  this.map     = $('#map-canvas');
  this.ctx     = $('#map-canvas')[0].getContext('2d');

  this.tiles = new Array(this.height);
  for (var i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Array();
  }

  // Set width and height
  this.ctx.canvas.width = this.width * this.scale;
  this.ctx.canvas.height = this.height * this.scale;
};

PokeMap.prototype = {

  // Accepts a tile object
  drawTile: function(tile, x, y) {
    // First clear the tile
    this.ctx.clearRect(x*this.scale, y*this.scale, 16, 16);

    var self = this;

    // Draw from layer 1 to 3
    tile.getLayers().forEach(function(layer) {
      self.ctx.drawImage(self.img, layer[0]*self.scale, layer[1]*self.scale, self.scale, self.scale, x*self.scale, y*self.scale, self.scale, self.scale);
    });
  },

  // Clear the canvas
  clearMap: function() {
    this.ctx.clearRect(0, 0, this.width*this.scale, this.height*this.scale);
  },

  // Renders the canvas using the tiles array
  renderMap: function() {

    // Clear the canvas first
    this.clearMap();

    // Now draw all the tiles
    for (var h = 0; h < this.height; h++) {
      //console.log("Rendering map: " + Math.ceil(h/this.height*100) + "%");
      for (var w = 0; w < this.width; w++) {
        this.drawTile(this.tiles[h][w], w, h);
      }
    }

  },

  // Generate random map with random tiles
  randomMap: function() {

    for (var h = 0; h < this.height; h++) {
      //console.log("Generating random map: " + Math.ceil(h/this.height*100) + "%");
      for (var w = 0; w < this.width; w++) {

        // Create tile with 3 random layers
        var tile = new Tile(
          [Math.floor((Math.random() * 8) + 1), Math.floor((Math.random() * 500) + 1)],
          [Math.floor((Math.random() * 8) + 1), Math.floor((Math.random() * 500) + 1)],
          [Math.floor((Math.random() * 8) + 1), Math.floor((Math.random() * 500) + 1)]
        );
        this.tiles[h][w] = tile;
      }
    }
  }
};
