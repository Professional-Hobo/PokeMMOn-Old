var PokeMap = function() {
  var self = this;

  this.scale   = 16;
  this.tile    = [0, 0];
  this.width   = 10;
  this.height  = 10;
  this.img     = new Image();
  this.img.src = "/img/editor/2_column_tileset.png";

  this.map     = $('#map');
  this.ctx     = $('#map')[0].getContext('2d');

  this.tiles = new Array(this.height);
  for (var i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Array();
  }

  // Set width and height
  this.ctx.canvas.width = this.width * this.scale;
  this.ctx.canvas.height = this.height * this.scale;

  // Initialize new blank canvas
  this.new();
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

  // New map
  new: function() {
    for (var h = 0; h < this.height; h++) {
      for (var w = 0; w < this.width; w++) {
        this.tiles[h][w] = new Tile();
      }
    }
  },

  // Clear the canvas
  clear: function() {
    this.ctx.clearRect(0, 0, this.width*this.scale, this.height*this.scale);
  },

  // Renders the canvas using the tiles array
  render: function() {

    // Clear the canvas first
    this.clear();

    // Now draw all the tiles
    for (var h = 0; h < this.height; h++) {
      console.log("Rendering map: " + Math.ceil(h/this.height*100) + "%");
      for (var w = 0; w < this.width; w++) {
        this.drawTile(this.tiles[h][w], w, h);
      }
    }

  },

  // Resizes the map and updates the positions
  resize: function(direction, amount, tileObject) {
    var self = this;
    tileObject = tileObject || new Tile();

    if (direction == "up" || direction == "down") {

      // Removing rows
      if (amount < 0) {
        amount = Math.abs(amount);

        // Make sure amount to remove is less than or equal to total rows in canvas
        // This prevents getting into the negatives
        amount = amount > this.height ? this.height : amount;

        for (var i = 0; i < amount; i++) {
          direction == "up" ? this.tiles.shift() : this.tiles.pop();
        }

        // Update height of pokemap object
        this.height -= amount;

      // Adding rows
      } else if (amount > 0 && this.height+amount <= 1024) {
        amount = Math.abs(amount);

        for (var i = 0; i < amount; i++) {
          // add pokemap-width number of new tiles.
          var toAdd = Array.apply(null, Array(Math.abs(this.width))).map(function(x) {
            return tileObject;
          });

          direction == "up" ? this.tiles.unshift(toAdd) : this.tiles.push(toAdd);
        }

        // Update height of pokemap object
        this.height += amount;

      } else {
        console.log("What are you doing SON!?");
      }

    } else if (direction == "right" || direction == "left") {

      // Removing cols
      if (amount < 0) {
        amount = Math.abs(amount);

        // Make sure amount to remove is less than or equal to total cols in canvas
        // This prevents getting into the negatives
        amount = amount > this.width ? this.width : amount;

        Object.keys(this.tiles).forEach(function(index) {
          for (var i = 0; i < amount; i++) {
            direction == "left" ? self.tiles[index].shift() : self.tiles[index].pop();
          }
        });

        // Update width of pokemap object
        this.width -= amount;

      // Adding cols
      } else if (amount > 0 && this.width+amount <= 1024) {
        amount = Math.abs(amount);

        Object.keys(this.tiles).forEach(function(index) {
          for (var i = 0; i < amount; i++) {
            direction == "left" ? self.tiles[index].unshift(tileObject) : self.tiles[index].push(tileObject);
          }
        });

        // Update width of pokemap object
        this.width += amount;

      } else {
        console.log("What are you doing SON!?");
      }

    } else {
      console.log("What are you doing SON!?");
    }

    // Update the attributes of the canvas tag
    this.map.attr("width", this.width*this.scale);
    this.map.attr("height", this.height*this.scale);

    // Render new resized map
    this.render();

    // Update dimensions viewer
    $("#dim").html("Current map dim: " + this.width + "x" + this.height);
  },

  // Generate random map with random tiles
  random: function() {

    for (var h = 0; h < this.height; h++) {
      console.log("Generating random map: " + Math.ceil(h/this.height*100) + "%");
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
