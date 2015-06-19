var Tileset = function() {
  var self = this;

  this.loadTilesets(function() {
    self.set = "all";
  });
};

Tileset.prototype = {
  loadTilesets: function(callback) {
    var self = this;

    $.get("editor/sets", function(data) {
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
    });
  }
};
