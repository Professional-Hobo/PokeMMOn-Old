var PokeMap = function() {
  var self = this;

  this.scale   = 16;
  this.tile    = [0, 0];
  this.width   = 1024;
  this.height  = 1024;
  this.img     = new Image();
  this.img.src = "img/editor/2_column_tileset.png";

  this.map     = $('#map');
  this.ctx     = $('#map')[0].getContext('2d');

  this.tiles   = [];

  // Set width and height
  this.ctx.canvas.width = this.width * this.scale;
  this.ctx.canvas.height = this.height * this.scale;

  initializeTiles();

  function initializeTiles() {
    for (var h = 0; h < self.height; h++) {
      for (var w = 0; w < self.width; w++) {
        self.tiles.push(new Tile());
      }
    }
  }
};

PokeMap.prototype = {
    drawTile: function(tile, x, y) {
        this.ctx.drawImage(this.img, tile[0]*this.scale, tile[1]*this.scale, this.scale, this.scale, x*this.scale, y*this.scale, this.scale, this.scale);
    },

    clearMap: function() {
      for (var h = 0; h < this.height; h++) {
        for (var w = 0; w < this.width; w++) {
          this.drawTile([0, 1], w, h);
          this.tiles.push({"id": 1});
        }
      }
    }
};
