function openMap(file, tilesetImg){
                var mapData = [];
                
                jQuery.get(file, function(data){
                    
                    mapObj = data;

                    // Defining tileset coords
                    // This is an old format that isn't used any more
                    var tileset = {
                        map_name: "default",
                        tiles: [
                            { name: "land",       char: "-", x: 0,  y: 0 },
                            { name: "grass",      char: "#", x: 0,  y: 1 }
                        ]
                    }

                    //Calculate the map size
                    function getMapWidth(){
                        var width = 0,
                            rows = mapObj.split("\n");
                        for (var i in rows){
                            var char = rows[i].split("");
                            var chars_x = char.length;

                            if(chars_x >= width){
                                width = chars_x
                            }
                        }
                        return width*grid;
                    }
                    function getMapHeight(){
                        var rows = mapObj.split("\n");
                        return (rows.length)*grid;
                    }
                                       
                    // Set the map size
                    function resizeMap(m){
                        var map_w = 0,
                            map_h = 0;

                        map_h = getMapHeight();
                        map_w = getMapWidth();

                        m.canvas.width = map_w;
                        m.canvas.height = map_h;
                    }   
                    resizeMap(m);

                    // Draw an image
                    function drawImage(imgData, posX, posY){
                        var img = new Image(),
                            posX = posX*grid,
                            posY = posY*grid;

                        img.onload = function(){
                            // m.drawImage(img, imgData.x*grid, imgData.y*grid, grid, grid, posX, posY, grid, grid);  
                            m.drawImage(img, imgData[0]*grid, imgData[1]*grid, grid, grid, posX, posY, grid, grid);  
                        };
                        img.src = tilesetImg;
                    }
                    
                    // Generate that map!
                    function generateMap(mapObj){
                        var sprite = mapObj.split(""),
                            lines = mapObj.split("\n")

                        for (var i in lines){
                            var s = lines[i].split("");
                            writeLine(i, s);
                        }

                        function writeLine(y, sprite){
                            for(var n in sprite){ 
                                // Check all the tilesets
                                 function checkChar(){
                                    for(var c in tileset.tiles){
                                        var char = tileset.tiles[c].char

                                        // If one of the characters matches the map, draw it
                                        if(char == sprite[n]){
                                            var defaultTile = [0,0]
                                            drawImage(defaultTile, n, y);    
                                        }
                                    }
                                }
                                checkChar();
                            }
                        }         
                    }
                    generateMap(mapObj);  
                    
                    // Allows you to draw on the map. WIP
                    function initiateDrawing(){
                        var temp_x = 0,
                            temp_y = 0,
                            blank_map = [],
                            new_map = [];

                        function setupBlankMap(){
                              var w = getMapWidth()/grid,
                                  h = getMapHeight()/grid;

                            for(n=0; n<h; n++){
                                var newLine = []
                                for(i=0; i<w; i++){
                                    newLine.push("(0,0)");  
                                }
                                blank_map.push(newLine); 
 
                            }
                            // console.log(blank_map);
                        }
                        setupBlankMap();

                        // Handle mousedown/up
                        var mousedown = 0
                        map.addEventListener('mousedown', function(e){
                            mousedown = 1;
                            drawAtPoint(e, brush);
                        });   
                        map.addEventListener('mouseup', function(e){
                            mousedown = 0;
                        });
                        
                        // Listen for mouse drawing
                        map.addEventListener('mousemove', function(e){
                            if(mousedown){ 
                                drawAtPoint(e, brush);
                            }
                        }, false)
                        
                        function drawAtPoint(mouse, b){
                            var mouse_x = Math.floor(mouse.offsetX/grid),
                                mouse_y = Math.floor(mouse.offsetY/grid);
                            
                            if(mouse_x != temp_x || mouse_y != temp_y){

                                drawImage(b, mouse_x, mouse_y);
                                    
                                new_map = blank_map;
                                new_map[mouse_y][mouse_x] = "("+b[0]+","+b[1]+")";

                                console.log("Brush", b);
                                //console.clear();
                                //console.log(JSON.stringify(new_map));
                                
                                temp_x = mouse_x;
                                temp_y = mouse_y;
                            }
                        } 
                    }
                    initiateDrawing();   
                    
                    // ******************************
                    var tilesetCanvas = document.getElementById('tileset');
                        t = tilesetCanvas.getContext('2d');

                    // Draw the tileset to the canvas
                    function drawTileset(src){
                        var tilesetImg = new Image(); 

                        tilesetImg.onload = function(){
                            t.drawImage(tilesetImg, 0, 0); 
                        }
                        tilesetImg.src=src;
                    }
                    drawTileset(mapSource); 

                    // Select Cell
                    function selectTile(){
                        
                        var _mousedown = 0, 
                            temp_x = 0,
                            temp_y = 0;
                        
                        // On click
                        tilesetCanvas.addEventListener("mousedown", function(e){
                            _mousedown = 1;
                            
                            var mouse_x = Math.floor(e.offsetX/grid),
                                mouse_y = Math.floor(e.offsetY/grid);

                            // Re-draw the tileset
                            t.clearRect(0,0,tilesetCanvas.width,tilesetCanvas.height);
                            drawTileset("img/map_tile.png"); 
                            
                            // Draw the rectangle
                            var selector = document.getElementById('selector');
                                selector.style.width = grid+'px';
                                selector.style.height = grid+'px';
                                selector.style.left = (mouse_x*grid)+'px';
                                selector.style.top = (mouse_y*grid)+'px';

                            brush = [mouse_x, mouse_y];
                            console.log(brush)
                                                        
                            initiateDrawing(brush); 
                        });
                        
                        // On Mouse up
                        tilesetCanvas.addEventListener("mouseup", function(e){
                            _mousedown = 0;
                            
                            var selector = document.getElementById('selector'),
                                selectedTiles = [];
                            
                            var selectionWidth = parseInt(selector.style.width)/grid,
                                selectionHeight = parseInt(selector.style.height)/grid,
                                selectionX = parseInt(selector.style.left)/grid,
                                selectionY = parseInt(selector.style.top)/grid
                            
                            console.log("w: "+selectionHeight);
                            console.log("h: "+selectionWidth);
                            console.log("x: "+selectionX);
                            console.log("y: "+selectionY);
                            
                            /*
                            for(var i=0; i<selectionHeight; i++){
                                var row = [];
                                for(var n=0; n<selectionWidth; n++){
                                    row.push("("+(n+selectionX)+","+(i+selectionY)+")");   
                                }
                                selectedTiles.push(row)
                            }*/
                            
                            selectedTiles = [selectionX, selectionY];
                            
                            console.log("selected", selectedTiles);
                            
                            brush = selectedTiles;
                            
                            
                            console.log(JSON.stringify(selectedTiles));
                        }, false);
  
                        // Mouse Move
                        tilesetCanvas.addEventListener("mousemove", function(e){
                            if(_mousedown){
                                var mouse_x = Math.floor(e.offsetX/grid),
                                    mouse_y = Math.floor(e.offsetY/grid); 
                                                        
                                if(mouse_x != temp_x || mouse_y != temp_y){
                                    console.log('new');  
                                    
                                    var selector = document.getElementById('selector'),
                                        selectorLeftCoords = parseInt(selector.style.left)
                                        selectorTopCoords = parseInt(selector.style.top)
                                        
                                        selector.style.width = (mouse_x*grid+grid)-(selectorLeftCoords)+'px';
                                        selector.style.height = (mouse_y*grid+grid)-(selectorTopCoords)+'px';
                                    
                                    temp_x = mouse_x;
                                    temp_y = mouse_y;
                                }
                                
                            }
                        }, false);

                    }
                    selectTile();
                    // ******************************
                });
            }
            openMap("map_blank.txt", mapSource);