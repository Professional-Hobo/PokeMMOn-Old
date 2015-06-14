$(function() {
    
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
    
    //
    // Listen for keycodes
    //
    window.addEventListener('keydown', function(e) {
        // 0
        if (e.keyCode == 48) {
            clientUpdateHistory($("[data-index=0]")[0])
        // 1
        } else if (e.keyCode == 49) {
            clientUpdateHistory($("[data-index=1]")[0])
        // 2
        } else if (e.keyCode == 50) {
            clientUpdateHistory($("[data-index=2]")[0])
        // 3
        } else if (e.keyCode == 51) {
            clientUpdateHistory($("[data-index=3]")[0])
        // 4
        } else if (e.keyCode == 52) {
            clientUpdateHistory($("[data-index=4]")[0])
        // 5
        } else if (e.keyCode == 53) {
            clientUpdateHistory($("[data-index=5]")[0])
        // W
        } else if(e.keyCode == 87) {
            brush[1] -= brush[1] > 0 ? 1 : 0
            drawTileSelector(brush[0], brush[1])
        // S
        } else if (e.keyCode == 83) {
            brush[1] += brush[1] < 997 ? 1 : 0
            drawTileSelector(brush[0], brush[1])
            if(brush[1] > 15){
                // Scroll function
            }
        // D
        } else if (e.keyCode == 68){
            brush[0] += brush[0] < 7 ? 1 : -7
            drawTileSelector(brush[0], brush[1])
        // A
        } else if (e.keyCode == 65){
            brush[0] -= brush[0] > 0 ? 1 : -7
            drawTileSelector(brush[0], brush[1])
        // E
        } else if (e.keyCode == 69) {
            window.location = '#export-pane';
        // Q
        } else if (e.keyCode == 81) {
            window.location = '#';
        // Up Arrow
        } else if (e.keyCode == 38){
           resizeTileSelector([0, -1])
        // Down Arrow
        } else if (e.keyCode == 40){
           resizeTileSelector([0, 1])
        // Left Arrow
        } else if (e.keyCode == 37){
           resizeTileSelector([-1, 0])
        // Right Arrow
        } else if (e.keyCode == 39){
           resizeTileSelector([1, 0])
        }
    })
    
    //
    // Download Buttons
    //
    $('#download-png').click(function(){
        var img = map.toDataURL("image/png");
        this.href = img;
    });
    $('#download-txt').click(function(){
        var output = mapArray;
        window.open('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(output)):JSON.stringify(output)));
    });
    
    //
    // Width and Height controls
    //
    $('#width').attr('value', mapWidth);
    $('#height').attr('value', mapHeight);

    $('#width').change(function(){
        resizeMap("w", this.value)
    })
    $('#height').change(function(){
        resizeMap("h", this.value)
    })
});


