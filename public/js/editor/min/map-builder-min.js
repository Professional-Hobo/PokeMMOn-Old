// Default Parameters
var grid        = 16;
var brush       = [0,0];
var mapWidth    = 40;
var mapHeight   = 30;
var mapSource   = "img/map_tile.png";
var mapArray    = [];
var brushHistory= [];
var tileSelectX = 0;
var tileSelectY = 0;
var tileSelectW = 1;
var tileSelectH = 1;

// 
// Draws an image to the canvas
//
// imgData.....an array with the tile's X and Y coordinates. ex. [2, 4]
// posX........X coordinate on the Map
// posy........Y coordinate on the map
//
function drawImage(imgData, posX, posY, sizeW, sizeH){
    var img = new Image();
    var posX = posX*grid;
    var posY = posY*grid;

    var sizeW = sizeW ? sizeW : grid;
    var sizeH = sizeH ? sizeH : grid;
    
    img.onload = function(){ 
        m.drawImage(img, imgData[0]*grid, imgData[1]*grid, grid, grid, posX, posY, sizeW, sizeH);  
    };
    img.src = mapSource;
}

//
// Generate a new blank map
//
// src.....Map's source image (tileset image)
// w.......Map's Width
// h.......Map's Height
//
var map = document.getElementById('map-canvas');
var m   = map.getContext('2d');

function newBlankMap(src, w, h){
    m.canvas.width = w*grid;
    m.canvas.height = h*grid;

    // Reset the map and brush
    mapArray = []

    for(var n=0; n<h; n++){
        var newRow = [];
        for(var i=0; i<w; i++){
            drawImage([0,0], i, n);
            newRow.push("(0,0)")
        }
        mapArray.push(newRow)
    }
}
newBlankMap(mapSource, mapWidth, mapHeight);

//
// Redraw the map
// 
// Takes a valid _mapArray and redraws the map from it
//
function redrawMap(_mapArray){

    var _mapWidth = _mapArray[0].length
    var _mapHeight = _mapArray.length

    for(var row in _mapArray){
        for(var col in _mapArray[row]){
            var tile = _mapArray[row][col];
            var reg  = /\((\d+), ?(\d+)\)/;
            var parsedTile = tile.match(reg);

            drawImage([parsedTile[1],parsedTile[2]], col, row)
        }
    }

    m.canvas.width = _mapWidth*grid;
    m.canvas.height = _mapHeight*grid;
    mapWidth = _mapWidth;
    mapHeight = _mapHeight;
    
    // updatePreviewPNG('map-image');
}

//
// Resize the map
//
// dir......Direction to resize. Right / Bottom.
// i........Increment number.
//
// NOTE: This code is not very DRY and needs to be redone 
// 
function resizeMap(dir, i){
    if(dir == "w"){
        if(i > mapArray[0].length){
            // If it's increased
            var changedBy = i - mapArray[0].length;

            for(var j=0; j<changedBy; j++){
                for(var n in mapArray){
                    mapArray[n].push("(0,0)");
                }
            }
        } else {
            // If it's decreased
            var changedBy = mapArray[0].length - i;
            for(var j=0; j<changedBy; j++){
                for(var n in mapArray){
                    mapArray[n].splice(mapArray[n].length-1,1)
                }
            }
        }
        redrawMap(mapArray);
    } else if(dir == "h"){
        if(i > mapArray.length){
            // If it's increased
            var changedBy = i - mapArray.length;
            var row = []

            for(var j=0; j<changedBy; j++){
                for(var k in mapArray[0]){
                    row.push("(0,0)")
                }
                mapArray.push(row)
            }         
        } else {
            // If it's decreased
            var changedBy = mapArray.length - i;
            for(var j=0; j<changedBy; j++){
                mapArray.splice(mapArray.length-1,1)
            }
        }
        redrawMap(mapArray);
    } else {
        console.log("error")
    }
}

//
// Build the tileset picker
//
// A simple function to draw the tileset picker on the left
//
var tilesetCanvas = document.getElementById('tileset');
var t = tilesetCanvas.getContext('2d');

function initiateTileset(){

    // Draw the tileset to the canvas
    function drawTileset(src){
        var tilesetImg = new Image(); 

        tilesetImg.onload = function(){
            t.drawImage(tilesetImg, 0, 0); 
        }
        tilesetImg.src=src;
    }
    drawTileset("img/map_tile@2x.png"); 

    // Add event listeners
    var tilesetMouseDown = 0;
    var tilesetTempX = 0;
    var tilesetTempY = 0;

    tilesetCanvas.addEventListener('mousedown', function(e){
        tilesetMouseDown = 1;
        selectTile(e);
    })

    function selectTile(e){
        var mouse_x = Math.floor(e.offsetX/(grid*2));
        var mouse_y = Math.floor(e.offsetY/(grid*2));

        // Draw the rectangle
        drawTileSelector(mouse_x, mouse_y)

        brush = [mouse_x, mouse_y];
        
        updateBrushHistory(brush);
        console.log("Brush: ("+brush[0]+","+brush[1]+")");
    }
}
initiateTileset();

//
// Draw tile selector
//
// Draws the tile selector to a specific location
//
function moveTileSelector(x, y){
    tileSelectX = x
    tileSelectY = y
    
    selector.style.left = tileSelectX*(grid*2)+"px";
    selector.style.top = tileSelectY*(grid*2)+"px";
}
function drawTileSelector(x, y){
    var selector = document.getElementById('selector');
        selector.style.width  = tileSelectW*(grid*2)+'px';
        selector.style.height = tileSelectH*(grid*2)+'px';
        
        moveTileSelector(x, y)
}
function resizeTileSelector(inc){
    
    tileSelectW += inc[0];
    tileSelectH += inc[1];
    
    drawTileSelector(tileSelectX, tileSelectY)
    
    /*
    console.log(tileSelectH*grid)
    
    var selector = document.getElementById('selector');
        selector.style.width = tileSelectW*(grid*2)+'px'
        selector.style.height = tileSelectH*(grid*2)+'px'
    */
}

//
// Update the brush history
//
// Adds your brush to the brush history array 
//
function updateBrushHistory(currBrush){
    
    brushHistory.unshift(currBrush);
    brushHistory.splice(6, 1); 
    
    for(var i in brushHistory){
        var elem = document.getElementById('hist_'+i);
        var hist = brushHistory[i];
        var histx = hist[0]*grid*2;
        var histy = hist[1]*grid*2;
        
        elem.style.backgroundImage = "url(img/map_tile@2x.png), url(img/grid.png)";
        elem.style.backgroundPosition = "-"+histx+"px -"+histy+"px";
    }
}
// Add the brush to the history to start
updateBrushHistory(brush)

//
// [WIP] Allows you to draw on the map.
//
// We need to both draw on the physical map, AND update the mapArray. 
//
function initiateDrawing(){
    var temp_x;
    var temp_y;
    var mousedown = 0;

    map.addEventListener('mousedown', function(e){
        mousedown = 1;
        drawAtPoint(e, brush);
    })
    map.addEventListener('mouseup', function(e){
        mousedown = 0;
    })
    map.addEventListener('mousemove', function(e){
        if(mousedown){
            drawAtPoint(e, brush);   
        }
    })

    function drawAtPoint(mouse, _brush){
        var mouse_x = Math.floor(mouse.offsetX/grid);
        var mouse_y = Math.floor(mouse.offsetY/grid);

        if(mouse_x != temp_x || mouse_y != temp_y){

            // Draw the tile
            drawImage(_brush, mouse_x, mouse_y);
            // Add it to the array
            mapArray[mouse_y][mouse_x] = "("+_brush[0]+","+_brush[1]+")";
            
            temp_x = mouse_x;
            temp_y = mouse_y;
        }
        // Update the PokeMap Image
        updatePreviewPNG('map-image');
        updatePokemapArray('pokemap-array');
    }
}
initiateDrawing();

// 
// Update the preview image
//
function updatePreviewPNG(imgID){
    var img = map.toDataURL("image/png");
    document.getElementById(imgID).src = img;
}
updatePreviewPNG('map-image');

//
// Update the PokeMap Array textarea
//
function updatePokemapArray(textID){
    var textID = document.getElementById(textID);
    textID.innerHTML = JSON.stringify(mapArray)
}

