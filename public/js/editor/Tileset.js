var Tileset = function() {
  var self = this;

  this.width   = 0;
  this.height  = 0;

  this.tileset = $('#tileset');
  this.ctx     = $('#tileset')[0].getContext('2d');

  this.image   = new Image();

};

Tileset.prototype = {
  loadTilesets: function(callback) {
    var self = this;

    $.ajax("editor/sets", {global: false, success: function(data) {
      self.sets = data;

      // Update world select with world options
      $('#tilesets').empty();

      $.each(data, function(key, value) {
          $('#tilesets')
              .append($("<option></option>")
              .attr("value", value)
              .text(value));
      });

      $('#tilesets').prop("disabled", false);

      typeof callback === 'function' && callback();
    }});
  },

  fetchTilesetDim: function(callback) {
    var self = this;
    $.ajax("editor/sets/" + this.set, {global: false, success: function(data) {

      self.width = data.width;
      self.height = data.height;

      typeof callback === 'function' && callback();
    }});
  },

  drawTileset: function() {
    this.ctx.drawImage(this.image, 0, 0);
  },

  changeTileset: function(set) {
    var self = this;

    this.clear();
    this.set = set;
    this.fetchTilesetDim(function() {
      // Set width and height of tileset canvas
      self.tileset.attr("width", self.width);
      self.tileset.attr("height", self.height);

      // Load in tileset image
      self.image.src = "img/editor/sets/" + self.set + ".png";

      self.image.onload = function() {
        self.drawTileset();
      }
    });
  },

  clear: function() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
};
