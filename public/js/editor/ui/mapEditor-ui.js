$(function() {
  //
  // Add map mode keyboard shortcuts
  //
  window.addEventListener('keydown', function(e) {
    if (!$("input").is(":focus")) {
      // W
      if (e.which == 87) {
        tileset.selectTile(tileset.mouse.tile_x, tileset.mouse.tile_y-1);
        // S
      } else if (e.which == 83) {
        tileset.selectTile(tileset.mouse.tile_x, tileset.mouse.tile_y+1);
        // D
      } else if (e.which == 68){
        tileset.selectTile(tileset.mouse.tile_x+1, tileset.mouse.tile_y);
        // A
      } else if (e.which == 65){
        tileset.selectTile(tileset.mouse.tile_x-1, tileset.mouse.tile_y);
        // Up Arrow
      } else if (e.which == 38){
        e.preventDefault();
        resizeTileSelector([0, -1])
        // Down Arrow
      } else if (e.which == 40){
        e.preventDefault();
        resizeTileSelector([0, 1])
        // Left Arrow
      } else if (e.which == 37){
        e.preventDefault();
        resizeTileSelector([-1, 0])
        // Right Arrow
      } else if (e.which == 39){
        e.preventDefault();
        resizeTileSelector([1, 0])
      }
    }
  });
  $("#x, #y").change(function() {
    console.log("blah");
    pokeworld.pokemap.updatePlayerPosByCoords($("#x").val(), $("#y").val());
  });

  //
  // Update the history when clicking on 0-5
  //
  function clientUpdateHistory(selected){
    var index = selected;
    var brushx = brushHistory[index][0];
    var brushy = brushHistory[index][1];

    brushHistory.splice(index, 1);

    brush = [brushx, brushy]
    updateBrushHistory(brush)
  }

  $('#history li').click(function(){
    clientUpdateHistory(this.dataset.index)
  });

  // Update tileset on tileset selector change
  $("#tilesets").change(function() {
    // Scroll to top
    $('#tileset-container').scrollTop(0);

    tileset.changeTileset($("#tilesets").val());
  });
});
