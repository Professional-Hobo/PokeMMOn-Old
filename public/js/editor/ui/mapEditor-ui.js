$(function() {
    tileset = new Tileset();
    //
    // Add map mode keyboard shortcuts
    //
    window.addEventListener('keydown', function(e) {
        if (!$("input").is(":focus")) {
            // W
            if(e.which == 87) {
                brush[1] -= brush[1] > 0 ? 1 : 0
                drawTileSelector(brush[0], brush[1])
            // S
            } else if (e.which == 83) {
                brush[1] += brush[1] < 997 ? 1 : 0
                drawTileSelector(brush[0], brush[1])
                if(brush[1] > 15){
                    // Scroll function
                }
            // D
            } else if (e.which == 68){
                brush[0] += brush[0] < 15 ? 1 : -15
                drawTileSelector(brush[0], brush[1])
            // A
            } else if (e.which == 65){
                brush[0] -= brush[0] > 0 ? 1 : -15
                drawTileSelector(brush[0], brush[1])
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

});
