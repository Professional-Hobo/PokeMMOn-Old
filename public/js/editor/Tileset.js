var Tileset = function() {
  var self = this;

  this.width   = 0;
  this.height  = 0;

  this.tileset = $('#tileset');
  this.ctx     = $('#tileset')[0].getContext('2d');

  this.image   = new Image();

  this.tilesets = {};

};

Tileset.prototype = {
  loadTilesets: function(callback) {
    var self = this;

    $.ajax("editor/sets", {global: false, success: function(data) {
      self.sets = data;

      $('#tilesets').empty();

      // Update tileset select
      $.each(data, function(key, value) {
          $('#tilesets')
              .append($("<option></option>")
              .attr("value", key)
              .text(key));
      });

      // Load all tileset images
      $.each(data, function(key, value) {
        self.tilesets[key] = {};
        self.tilesets[key].img = new Image();
        self.tilesets[key].img.src = "img/editor/sets/" + key + ".png";

        self.tilesets[key].width = value.width;
        self.tilesets[key].height = value.height;
      });

      $('#tilesets').prop("disabled", false);

      typeof callback === 'function' && callback();
    }});
  },


  drawTileset: function() {
    this.ctx.drawImage(this.image, 0, 0);
  },

  changeTileset: function(set) {
    this.clear();
    this.set = set;

    // Set width and height of tileset canvas
    this.tileset.attr("width", this.tilesets[set].width);
    this.tileset.attr("height", this.tilesets[set].height);

    this.width = this.tilesets[set].width;
    this.height = this.tilesets[set].height;

    // Load in tileset image
    this.image.src = this.tilesets[set].img.src;

    var self = this;
    this.image.onload = function() {
      self.drawTileset();
    }
  },

  clear: function() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
};
