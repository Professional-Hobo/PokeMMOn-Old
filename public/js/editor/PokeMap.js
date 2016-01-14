var PokeMap = function(tiles) {
    this.dim = {
        width: 25,
        height: 25
    };

    this.pos = [0, 0];

    this.offset = {
        x: -this.pos[0] * 16,
        y: -this.pos[1] * 16
    };

    this.map = $('#map');
    this.ctx = $('#map')[0].getContext('2d');

    if (tiles === undefined) {

        // Allocate tiles matrix
        this.tiles = new Array(this.getHeight());
        for (var i = 0; i < this.getHeight(); i++) {
            this.tiles[i] = new Array(this.getWidth());
        }

        // Populate with default grass
        for (var h = 0; h < this.getHeight(); h++) {
            for (var w = 0; w < this.getWidth(); w++) {
                this.tiles[h][w] = new Tile(0)
            }
        }
    } else {
        this.tiles = tiles;
    }

    // Calculate dim from matrix dims
    this.setWidth(this.tiles[0].length);
    this.setHeight(this.tiles.length)

    // Set width and height of canvas to canvas-container with 64px border of padding
    this.ctx.canvas.width = Math.floor($(".canvas-container").width() / 16) * 16 - 64;
    this.ctx.canvas.height = Math.floor($(".canvas-container").height() / 16) * 16 - 64;

    // Disable right click menu
    $('#map')[0].oncontextmenu = function(e) {
        e.preventDefault();
    };
};

PokeMap.prototype = {
    // Deletes a tile (data only)
    deleteTile: function(x, y) {
        this.tiles[x][y].clearLayers();
    },

    drawTileNew: function(id, x, y) {
        this.ctx.drawImage(tileset.tilesets.all.img, (id % 16) * 16, Math.floor(id / 16) * 16, 16, 16, x * 16 + this.offset.x, y * 16 + this.offset.y, 16, 16);
    },

    updatePlayerPosByCoords: function(x, y) {
        this.offset.x = x * 16;
        this.offset.y = y * 16;

        this.pos = [-x, -y];

        this.renderAroundCenter();
    },

    updatePlayerPosByOffset: function() {
        this.pos[0] = -Math.round(this.offset.x / 16);
        this.pos[1] = -Math.round(this.offset.y / 16);

        this.renderAroundCenter();
    },

    renderAroundCenter: function() {
        var self = this;
        this.clear();

        var viewport_tile_width = this.getCanvasWidth() / 16;
        var viewport_tile_height = this.getCanvasHeight() / 16;

        half_width = this.getCanvasWidth() / 32;
        half_height = this.getCanvasHeight() / 32;

        render = [];

        // Determine the tiles to render starting from top left corner
        for (var a = this.pos[1]; a < this.pos[1] + viewport_tile_height; a++) {
            for (var b = this.pos[0]; b < this.pos[0] + viewport_tile_width; b++) {
                // Ignore negative tiles and ignore tiles larger than map
                if ((a < 0 || b < 0) || (a >= this.getHeight() || b >= this.getWidth())) {
                    continue;
                } else {
                    render.push([a, b]);
                }
            }
        }

        // Calculate min/max x/y
        bounds = {
            largest: {
                x: Math.max.apply(null, render.map(function(item) {
                    return item[1];
                })),
                y: Math.max.apply(null, render.map(function(item) {
                    return item[0];
                }))
            },
            smallest: {
                x: Math.min.apply(null, render.map(function(item) {
                    return item[1];
                })),
                y: Math.min.apply(null, render.map(function(item) {
                    return item[0];
                }))
            }
        };

        // Push raw_padding
        // Raw padding is not sanitized

        // Top
        start = [bounds.smallest.x - 1, bounds.smallest.y - 1];
        end = [bounds.largest.x + 1, bounds.largest.y + 1];

        raw_padding = [];

        // Top and Bottom
        for (var i = start[0]; i <= end[0]; i++) {
            raw_padding.push([start[1], i]); // Top
            raw_padding.push([end[1], i]); // Bottom
        }

        // Left and Right
        for (var i = start[1]; i <= end[1]; i++) {
            raw_padding.push([i, end[0]]); // Right
            raw_padding.push([i, start[0]]); // Left
        }

        // Sanitize padding
        padding = [];
        raw_padding.forEach(function(coords) {
            if (coords[0] >= 0 && coords[0] < self.tiles.length && coords[1] >= 0 && coords[1] < self.tiles[0].length) {
                padding.push(coords);
            }
        });

        render = render.concat(padding); // Add padding to rendering tiles

        render.forEach(function(tile) {
            var layers = self.tiles[tile[0]][tile[1]].layers;
            if (layers.length != 1) {
                layers.forEach(function(layer) {
                    self.drawTileNew(layer, tile[1], tile[0]);
                });
            } else {
                self.drawTileNew(layers[0], tile[1], tile[0]);
            }
        });

        // Hover for tile placement - Preview
        if (pokeworld.mouse.inBounds) {
            this.ctx.save();
            this.ctx.globalAlpha = .7;

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
                        tiles.forEach(function(tile) {

                            // Verify coords are inbounds of pokemap
                            if (tile.x + tileset.selectorDim()[0] * x < self.dim.width && tile.y + tileset.selectorDim()[1] * y < self.dim.height) {
                                self.drawTileNew(tile.id, tile.x + tileset.selectorDim()[0] * x, tile.y + tileset.selectorDim()[1] * y);
                            }
                        });
                    }
                }
            } else {
                for (var x = 0; x < pokeworld.multi.x; x++) {
                    for (var y = 0; y < pokeworld.multi.y; y++) {

                        // Verify coords are inbounds of pokemap
                        if (pokeworld.mouse.hover_x + tileset.selectorDim()[0] * x < self.dim.width && pokeworld.mouse.hover_y + tileset.selectorDim()[1] * y < self.dim.height) {
                            self.drawTileNew(tileset.mouse.tileID, pokeworld.mouse.hover_x + tileset.selectorDim()[0] * x, pokeworld.mouse.hover_y + tileset.selectorDim()[1] * y);
                        }
                    }
                }
            }
            this.ctx.restore();
        }
    },

    // Defines what tile at x/y is
    setTile: function(tile, x, y) {
        if (typeof tile === "number") {
            tile = [tile];
        }
        if (pokeworld.mouse.inBounds) {
            this.tiles[x][y].setLayers(tile.slice());
            pokeworld.currentMap().tiles[x][y].setLayers(tile.slice());
        }
    },

    // New map
    new: function(tileObject) {
        for (var h = 0; h < this.getHeight(); h++) {
            for (var w = 0; w < this.getWidth(); w++) {
                this.tiles[h][w] = new Tile(tileObject) || new Tile();
                pokeworld.currentMap().tiles[h][w] = new Tile(tileObject) || new Tile();
            }
        }
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
                this.getHeight() -= amount;
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
                this.getHeight() += amount;
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
                this.getWidth() -= amount;
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
                this.getWidth() += amount;
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
                    typeof cb === 'function' && cb();
                }
            }
        }
    },

    // Update canvas width/height attributes
    updateAttr: function() {
        //this.map.attr("width", this.getWidth()*16);
        //this.map.attr("height", this.getHeight()*16);
    },

    updateDim: function() {
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
};
