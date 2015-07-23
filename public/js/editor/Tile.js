var Tile = function() {
  var args = Array.prototype.slice.call(arguments).slice(0, 2);
  var self = this;

  this.layers = [];

  if (args.length != 0) {
    if (typeof args[0] === 'object') {
      args[0].forEach(function(argument) {
        self.layers.push(argument);
      });
    } else {
      args.forEach(function(argument) {
        self.layers.push(argument);
      });
    }
  }
};

// Clear all layers
Tile.prototype.clearLayers = function() {
  this.layers = [];
};

// Get specific layers
Tile.prototype.getLayer = function(layer) {
  return this.layers[layer - 1];
};

// Returns all layers
Tile.prototype.getLayers = function() {
  return this.layers;
};

// Sets individual layers
Tile.prototype.setLayer = function(layer, id) {
  this.layers[layer - 1] = id;
};

// Clear layers and then set multiple layers at once
Tile.prototype.setLayers = function() {
  this.clearLayers();
  var args = Array.prototype.slice.call(arguments).slice(0, 2);
  var self = this;

  if (args.length != 0) {
    if (typeof args[0] === 'object') {
      args[0].reverse();

      args[0].forEach(function(argument) {
        self.layers.push(argument);
      });
    } else {
      args.reverse();

      args.forEach(function(argument) {
        self.layers.push(argument);
      });
    }
  }
};

if (typeof exports !== 'undefined') {
  exports = module.exports = Tile;
}
