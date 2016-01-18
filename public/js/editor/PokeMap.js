var PokeMap = function(tiles) {
    var self = this;
    this.tiles = tiles;

    this.dim = {
        width: 25,
        height: 25
    };

    this.pos = [0, 0];

    this.offset = {
        x: -this.pos[0] * 16,
        y: -this.pos[1] * 16
    };

    this.map = document.getElementById('map')
    this.ctx = this.map.getContext('2d');

    // Calculate dim from matrix dims
    this.setWidth(this.tiles[0].length);
    this.setHeight(this.tiles.length)

    // Set width and height of canvas to canvas-container with 64px border of padding
    this.ctx.canvas.width = Math.floor($(".canvas-container").width() / 16) * 16 - 64;
    this.ctx.canvas.height = Math.floor($(".canvas-container").height() / 16) * 16 - 64;

    this.preview = document.createElement("canvas");
    this.preview.width = 1024;
    this.preview.height = 1024;
    this.preview.style.width = 1024 + "px";
    this.preview.style.height = 1024 + "px";

    // Disable right click menu
    this.map.oncontextmenu = function(e) {
        e.preventDefault();
    };

    this.genTiles(function() {
        self.genCanvases(function() {
            console.log("done");
        });
    });
};

PokeMap.prototype = {
    genTiles: function(callback) {
        if (this.tiles === undefined) {

            // Allocate tiles matrix
            this.tiles = new Array(this.getHeight());
            for (var i = 0; i < this.getHeight(); i++) {
                this.tiles[i] = new Array(this.getWidth());
            }

            // Populate with default grass
            for (var h = 0; h < this.getHeight(); h++) {
                for (var w = 0; w < this.getWidth(); w++) {
                    this.tiles[h][w] = new Tile(0)

                    if (h === this.getHeight() - 1 && w === this.getWidth() - 1) {
                        typeof callback === 'function' && callback();
                    }
                }
            }
        } else {
            typeof callback === 'function' && callback();
        }
    },

    // Deletes a tile (data only)
    deleteTile: function(x, y) {
        this.tiles[x][y].clearLayers();
        this.regenCanvas(Math.floor(x/16), Math.floor(y/16));
    },

    drawTile: function(id, x, y) {
        this.ctx.drawImage(tileset.tilesets.all.img, (id % 16) * 16, Math.floor(id / 16) * 16, 16, 16, x * 16 + this.offset.x, y * 16 + this.offset.y, 16, 16);
        this.regenCanvas(Math.floor(x/16), Math.floor(y/16));
    },

    updatePlayerPosByCoords: function(x, y) {
        this.offset.x = x * 16;
        this.offset.y = y * 16;

        this.pos = [-x, -y];

        this.render();
    },

    updatePlayerPosByOffset: function() {
        this.pos[0] = -Math.round(this.offset.x / 16);
        this.pos[1] = -Math.round(this.offset.y / 16);

        this.render();
    },

    render: function() {
        var self = this;
        this.clear();
        for (var i = 0; i < canvases.length; i++) {
            for (var j = 0; j < canvases[0].length; j++) {
                this.ctx.drawImage(canvases[i][j], this.offset.x+128*i, this.offset.y+128*j);
            }
        }

        // Hover for tile placement - Preview
        if (pokeworld.mouse.inBounds) {
            this.ctx.drawImage(this.preview, Math.floor(pokeworld.mouse.x/16)*16 + this.offset.x,  Math.floor(pokeworld.mouse.y/16)*16 + this.offset.y);
        }
    },

    // Defines what tile at x/y is
    setTile: function(tile, x, y) {
        if (typeof tile === "number") {
            tile = [tile];
        }
        this.tiles[x][y].setLayers(tile.slice());
        pokeworld.currentMap().tiles[x][y].setLayers(tile.slice());

        this.regenCanvas(Math.floor(y/8), Math.floor(x/8));
    },

    // New map
    new: function(tileObject) {
        for (var h = 0; h < this.getHeight(); h++) {
            for (var w = 0; w < this.getWidth(); w++) {
                this.tiles[h][w] = new Tile(tileObject) || new Tile();
                pokeworld.currentMap().tiles[h][w] = new Tile(tileObject) || new Tile();
            }
        }
        this.genCanvases()
    },

    // Clear the canvas
    clear: function() {
        this.ctx.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
    },

    // Resizes the map and updates the positions
    resize: function(direction, amount, tileObject) {
        var self = this;

        if (direction === "up" || direction === "down") {

            // Removing rows
            if (amount < 0) {
                amount = Math.abs(amount);

                // Make sure amount to remove is less than or equal to total rows in canvas
                // This prevents getting into the negatives
                amount = amount > this.getHeight() ? this.getHeight() : amount;
                for (var i = 0; i < amount; i++) {
                    this.tiles[direction === "up" ? "shift" : "pop"]();
                    pokeworld.currentMap().tiles[direction === "up" ? "shift" : "pop"]()
                }

                // Update height of pokemap object
                this.setHeight(this.getHeight() - amount);
                pokeworld.currentMap().info.dimensions.height -= amount;

                // Adding rows
            } else if (amount > 0 && this.getHeight() + amount <= 1024) {
                amount = Math.abs(amount);

                for (var i = 0; i < amount; i++) {
                    // add pokemap-width number of new tiles.
                    var toAdd = Array.apply(null, Array(Math.abs(this.getWidth()))).map(function(x) {
                        return new Tile(0);
                    });
                    this.tiles[direction === "up" ? "unshift" : "push"](toAdd.slice());
                    pokeworld.currentMap().tiles[direction === "up" ? "unshift" : "push"](toAdd.slice());
                }

                // Update height of pokemap object
                this.setHeight(this.getHeight() + amount);
                pokeworld.currentMap().info.dimensions.height += amount;
            }

        } else if (direction === "right" || direction === "left") {

            // Removing cols
            if (amount < 0) {
                amount = Math.abs(amount);

                // Make sure amount to remove is less than or equal to total cols in canvas
                // This prevents getting into the negatives
                amount = amount > this.getWidth() ? this.getWidth() : amount;

                Object.keys(this.tiles).forEach(function(index) {
                    for (var i = 0; i < amount; i++) {
                        self.tiles[index][direction === "left" ? "shift" : "pop"]();
                        pokeworld.currentMap().tiles[index][direction === "left" ? "shift" : "pop"]();
                    }
                });

                // Update width of pokemap object
                this.setWidth(this.getWidth() - amount);
                pokeworld.currentMap().info.dimensions.width -= amount;

                // Adding cols
            } else if (amount > 0 && this.getWidth() + amount <= 1024) {
                amount = Math.abs(amount);

                Object.keys(this.tiles).forEach(function(index) {
                    for (var i = 0; i < amount; i++) {
                        self.tiles[index][direction === "left" ? "unshift" : "push"](new Tile(0));
                        pokeworld.currentMap().tiles[index][direction === "left" ? "unshift" : "push"](new Tile(0));
                    }
                });

                // Update width of pokemap object
                this.setWidth(this.getWidth() + amount);
                pokeworld.currentMap().info.dimensions.width += amount;
            }
        }

        // Update dimensions viewer
        this.updateDim();
    },

    // Generate random map with random tiles
    random: function(cb) {
        for (var h = 0; h < this.getHeight(); h++) {
            //console.log("Generating random map: " + Math.ceil(h/this.getHeight()*100) + "%");
            for (var w = 0; w < this.getWidth(); w++) {

                // Create tile with 2 random layers
                var tile = new Tile(
                    Math.floor((Math.random() * tileset.height) + 1),
                    Math.floor((Math.random() * tileset.height) + 1)
                );
                this.tiles[h][w] = tile;
                pokeworld.currentMap().tiles[h][w] = tile;
                if (h === this.getHeight() - 1 && w === this.getWidth() - 1) {
                    this.genCanvases()
                    typeof cb === 'function' && cb();
                }
            }
        }
    },

    updateDim: function() {
        this.genCanvases()
        $("#dim").html("Current map dim: " + this.getWidth() + "x" + this.getHeight());
    },

    // Getters and Setters //

    getHeight: function() {
        return this.dim.height;
    },

    getCanvasHeight: function() {
        return this.ctx.canvas.height
    },

    getWidth: function() {
        return this.dim.width;
    },

    getCanvasWidth: function() {
        return this.ctx.canvas.width;
    },

    setHeight: function(height) {
        this.dim.height = height;
    },

    setCanvasHeight: function(height) {
        this.ctx.canvas.height = height;
    },

    setWidth: function(width) {
        this.dim.width = width;
    },

    setCanvasWidth: function(width) {
        this.ctx.canvas.width = width;
    },

    genCanvases: function(callback) {
        // Generate all of the canvases
        canvases = [];
        this.grid = this.gridify(this.tiles);

        for (var i = 0; i < this.grid.length; i++) {
            canvases[i] = [];
            for (var j = 0; j < this.grid[0].length; j++) {

                // Create new Canvas offscreen
                canvases[i][j] = document.createElement("canvas");
                canvases[i][j].width=128
                canvases[i][j].height=128
                canvases[i][j].style.width=128 + "px"
                canvases[i][j].style.height=128 + "px"
                gridContext = canvases[i][j].getContext('2d');

                var slice = this.grid[i][j];
                for (var k = 0; k < slice.length; k++) {
                  for (var l = 0; l < slice[0].length; l++) {
                    var tile = slice[k][l];
                    gridContext.drawImage(tileset.image, (tile.getLayer(1) % 16) * 16, Math.floor(tile.getLayer(1) / 16) * 16, 16, 16, l*16, k*16, 16, 16);
                    gridContext.drawImage(tileset.image, (tile.getLayer(2) % 16) * 16, Math.floor(tile.getLayer(2) / 16) * 16, 16, 16, l*16, k*16, 16, 16);
                  }
                }
                if (i === this.grid.length-1 && j === this.grid.length-1) {
                    typeof callback === 'function' && callback();
                }
            }
        }
    },

    regenCanvas: function(x, y) {
        gridContext = canvases[x][y].getContext('2d');

        var slice = this.grid[x][y];
        for (var k = 0; k < slice.length; k++) {
          for (var l = 0; l < slice[0].length; l++) {
            var tile = slice[k][l];
            gridContext.drawImage(tileset.image, (tile.getLayer(1) % 16) * 16, Math.floor(tile.getLayer(1) / 16) * 16, 16, 16, l*16, k*16, 16, 16);
            gridContext.drawImage(tileset.image, (tile.getLayer(2) % 16) * 16, Math.floor(tile.getLayer(2) / 16) * 16, 16, 16, l*16, k*16, 16, 16);
          }
        }
    },

    gridify: function(matrix, size) {
      // Default size of 64 per quadrant
      var size = size || 8;

      // Minimum size of a quadrant since viewport is 32 wide.
      if (size < 16) size = 8;

      // Maximum size of a quadrant since largest supported viewport is 1,024px x 1,024px
      else if (size > 64) size = 64;

      // Get dimensions of map source
      var width = matrix[0].length;
      var height = matrix.length;

      // Calculate how many matrices we will have
      var widthGrids = Math.ceil(width/size);
      var heightGrids = Math.ceil(height/size);
      var grids = [];

      // Calculate the areas of the matrix to slice
      for (var i = 0; i < widthGrids; i++) {
        grids[i] = [];

        for (var j = 0; j < heightGrids; j++) {
          //grids[i][j] = "X: " + j*size + ", Y: " + i*size + " => X: " + (j+1)*size + ", Y: " + (i+1)*size;
          grids[i][j] = [[j*size, i*size], [(j+1)*size, (i+1)*size]];
        }
      }

      // Actually slice using calculations from above loop
      var sections = [];
      for (var i = 0; i < grids.length; i++) {
        sections[i] = [];

        for (var j = 0; j < grids[0].length; j++) {
          // Make a quadrant from 0,0 to 4,4
          // map.slice(0, 4).map(function(grid) { return grid.slice(0, 4); });
          sections[i][j] = matrix.slice(grids[i][j][0][0], grids[i][j][1][0]).map(function(grid) { return grid.slice(grids[i][j][0][1], grids[i][j][1][1]); });
        }
      }

      return sections;
    },

  renderPreview: function() {
      var self = this;
      var context = this.preview.getContext('2d');
      context.clearRect(0, 0, 1024, 1024);
      context.globalAlpha = .7;

      // group tiles
      if (tileset.multi) {
          var start = [tileset.mouse.tile_x, tileset.mouse.tile_y];
          var end = [tileset.mouse.tile_x + tileset.selectorDim()[0], tileset.mouse.tile_y + tileset.selectorDim()[1]];
          var tiles = [];

          // Determine tiles to draw from left top corner to bottom right corner
          for (var a = start[1], i = 0; a < end[1]; a++, i++) {
              for (var b = start[0], j = 0; b < end[0]; b++, j++) {
                  if (b <= 15 && a <= 500) { // Make sure tiles are within the tileset
                      tiles.push({
                          id: a * 16 + b,
                          x: pokeworld.mouse.hover_x + j,
                          y: pokeworld.mouse.hover_y + i
                      });
                  }
              }
          }

          // Now determine if we are drawing multiple instances
          for (var x = 0; x < pokeworld.multi.x; x++) {
              for (var y = 0; y < pokeworld.multi.y; y++) {
                  var id = tileset.mouse.tileID;
                  var d_x = pokeworld.mouse.hover_x + tileset.selectorDim()[0] * x;
                  var d_y = pokeworld.mouse.hover_y + tileset.selectorDim()[1] * y;

                  tiles.forEach(function drawingthing(tile) {
                      context.drawImage(tileset.tilesets.all.img, (id % 16) * 16, Math.floor(id / 16) * 16, 16, 16, x*16, y*16, 16, 16);
                  });
              }
          }
      } else {
          for (var x = 0; x < pokeworld.multi.x; x++) {
              for (var y = 0; y < pokeworld.multi.y; y++) {
                  var id = tileset.mouse.tileID;
                  var d_x = pokeworld.mouse.hover_x + tileset.selectorDim()[0] * x;
                  var d_y = pokeworld.mouse.hover_y + tileset.selectorDim()[1] * y;
                  context.drawImage(tileset.tilesets.all.img, (id % 16) * 16, Math.floor(id / 16) * 16, 16, 16, x*16, y*16, 16, 16);
              }
          }
      }
  }
};
