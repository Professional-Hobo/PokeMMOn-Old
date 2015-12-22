$(function() {
  canvas = document.getElementById('game');
  context = canvas.getContext('2d');
  
  // Load tileset to draw from
  tileset = new Image();
  tileset.src = "http://localhost:3000/img/editor/sets/all.png";
  tileset.onload = function() {
    
    loadAndRender = function() {
      $.get("http://localhost:3000/editor/world/test%20world", function(data) {
        map = data;
        dim = map.maps.default.info.dimensions;
        src = map.maps.default.tiles;
        for (var i = 0; i < src.length; i++) {
          for (var j = 0; j < src[0].length; j++) {
            src[i][j] = new Tile(src[i][j].layers);
          }
        }
        for (var i = 0; i < src.length; i++) {
          for (var j = 0; j < src[0].length; j++) {
            var tile = src[i][j];
            context.drawImage(tileset, (tile.getLayer(1) % 16) * 16, Math.floor(tile.getLayer(1) / 16) * 16, 16, 16, j*16, i*16, 16, 16);
            context.drawImage(tileset, (tile.getLayer(2) % 16) * 16, Math.floor(tile.getLayer(2) / 16) * 16, 16, 16, j*16, i*16, 16, 16);
          }
        }
        // context.drawImage(tileset, (0 % 16) * 16, Math.floor(0 / 16) * 16, 16, 16, 0, 0, 0,0);
      });
    }
    loadAndRender();
  };
});