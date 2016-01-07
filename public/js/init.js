// Get server from play page
var server = $('server').html();
var UP = 87;
var DOWN = 83;
var RIGHT = 68;
var LEFT = 65;
var size = 64;

// Canvas
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

// For model and tile info
var models;
var tiles;

async.series([
    function background(callback){
        $("#game").hide();

        background = new Image();
        background.src = "assets/world/surface.png";
        callback(null);
    },

    function fetchWorld(callback){
        $.get("editor/world/test world", function(data) {
            map = data;
            dim = map.maps.default.info.dimensions;
            src = map.maps.default.tiles;

            // Convert into Tile objects
            for (var i = 0; i < src.length; i++) {
              for (var j = 0; j < src[0].length; j++) {
                src[i][j] = new Tile(src[i][j].layers);
              }
            }

            tileset = new Image();
            tileset.src = "img/editor/sets/all.png";
            tileset.onload = function() {
                // Generate all of the canvases
                canvases = [];
                grid = gridify(src, size);

                for (var i = 0; i < grid.length; i++) {
                    canvases[i] = [];
                    for (var j = 0; j < grid[0].length; j++) {

                        // Create new Canvas offscreen
                        canvases[i][j] = document.createElement("canvas");
                        canvases[i][j].width=size*16
                        canvases[i][j].height=size*16
                        canvases[i][j].style.width=size*16 + "px"
                        canvases[i][j].style.height=size*16 + "px"
                        gridContext = canvases[i][j].getContext('2d');

                        var slice = grid[i][j];
                        for (var k = 0; k < slice.length; k++) {
                          for (var l = 0; l < slice[0].length; l++) {
                            var tile = slice[k][l];
                            gridContext.drawImage(tileset, (tile.getLayer(1) % 16) * 16, Math.floor(tile.getLayer(1) / 16) * 16, 16, 16, l*16, k*16, 16, 16);
                            gridContext.drawImage(tileset, (tile.getLayer(2) % 16) * 16, Math.floor(tile.getLayer(2) / 16) * 16, 16, 16, l*16, k*16, 16, 16);
                          }
                        }
                        if (i === grid.length-1 && j === grid.length-1) {
                            socket = io(server);
                            callback(null);
                        }
                    }
                }
            };
        });
    },

    function makeWorld(callback) {
        // Load
        socket.on('preData', function(data) {
            $.getJSON("js/models.json", function(modelData) {
                models = modelData;
                $.getJSON("js/tiles.json", function(tileData) {
                    tiles = tileData;
                    // Load player location data first before starting game since game depends on player's initial spot
                    game = new Game({
                        "server": server,
                        "socket": socket
                    });

                    game.start(data.username, data.model, data.direction, data.x, data.y, function() {
                        callback(null);
                    });
                });
            });
        });
    },

    function socketListeners(callback) {
        socket.emit('hey', "Hi there!");
        socket.on('hey', function(data) {
            console.log(data);
        });

        socket.on('msg', function(data) {
            window.alert(data);
        });

        socket.on('update', function(data) {
            game.playerData = $.parseJSON(data);
        });

        socket.on('move', function(data) {
            game.player.move(data);
        });

        socket.on('multiple logins', function(data) {
            cancelAnimationFrame(game.loop);
            console.log(data);
            context.save();
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, 528, 528);
            context.restore();
            context.font = "20px Georgia";
            context.fillStyle = 'white';
            context.fillText("You've logged in from another location!", 75, 264);
            multiple_login = true;
        });

        socket.on('disconnect', function(data) {
            console.log("Disconnected from server");
            cancelAnimationFrame(game.loop);
            if (!multiple_login) {
                context.save();
                context.fillStyle = "rgba(0, 0, 0, 0.5)";
                context.fillRect(0, 0, 528, 528);
                context.restore();
                context.font = "20px Georgia";
                context.fillStyle = 'white';
                context.fillText("You've been disconnected from the server!", 75, 264);
            }
        });

        socket.on('error', function(data) {
            console.log(data);
        });

        resize();

        window.addEventListener('load', resize, false);
        window.addEventListener('resize', resize, false);

        multiple_login = false;

        callback(null);
    },

    function showWorld(callback) {
        // Game is hidden until everything is loaded
        game.freeze = true;
          $('#game')
            .attr('width', game.dim)
            .attr('height', game.dim)
            .css('width', game.dim + "px")
            .css('height', game.dim + "px");

            // Center game canvas on screen if not full screen already
            if (!game.isFullScreen) {
                $('#game')
                .css('margin-left', (window.innerWidth-game.dim)/2 + "px")
                .css('margin-top', (window.innerHeight-game.dim)/2 + "px");
            } else {
                $('#game')
                .css('margin-left', "")
                .css('margin-top', "");
            }

          $('#loading').text('');
          $("#game").fadeIn(1000, function() {
            resize();
            $('#loading').text('');

            // Allow player to move
            game.freeze = false;

            callback(null);
        });
    }
],
// optional callback
function(err, results){
    console.log("done!");
});

function resize() {
    $('#game')
        .attr('width', game.dim)
        .attr('height', game.dim)
        .css('width', game.dim + "px")
        .css('height', game.dim + "px");

    if (!game.isFullScreen) {
        $('#game')
        .css('margin-left', (window.innerWidth-game.dim)/2 + "px")
        .css('margin-top', (window.innerHeight-game.dim)/2 + "px");
    } else {
        $('#game')
        .css('margin-left', "")
        .css('margin-top', "");
    }
}

// Seperate large source map into usable pieces of specified size
function gridify(matrix, size) {
  // Default size of 64 per quadrant
  var size = size || 64;

  // Minimum size of a quadrant since viewport is 32 wide.
  //if (size < 16) size = 16;

  // Maximum size of a quadrant since largest supported viewport is 1,024px x 1,024px
  //else if (size > 64) size = 64;

  // Get dimensions of map source
  var width = matrix[0].length;
  var height = matrix.length;

  // Calculate how many matrices we will have
  var widthGrids = Math.ceil(width/size);
  var heightGrids = Math.ceil(width/size);
  var grids = [];

  // Calculate the areas of the matrix to slice
  for (var i = 0; i < widthGrids; i++) {
    grids[i] = [];

    for (var j = 0; j < heightGrids; j++) {
      //grids[i][j] = "X: " + j*size + ", Y: " + i*size + " => X: " + (j+1)*size + ", Y: " + (i+1)*size;
      grids[i][j] = [[j*size, i*size], [(j+1)*size, (i+1)*size]];
    }
  }

  // Actually slice using calculations from above loop
  var sections = [];
  for (var i = 0; i < grids.length; i++) {
    sections[i] = [];

    for (var j = 0; j < grids[0].length; j++) {
      // Make a quadrant from 0,0 to 4,4
      // map.slice(0, 4).map(function(grid) { return grid.slice(0, 4); });
      sections[i][j] = src.slice(grids[i][j][0][0], grids[i][j][1][0]).map(function(grid) { return grid.slice(grids[i][j][0][1], grids[i][j][1][1]); });
    }
  }

  return sections;
}

function getTile(x, y) {
    if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
    }

    if (src[x] !== undefined) {
        if (src[x][y] !== undefined) {
            return src[x][y];
        }
    }
    return new Tile(0);
};

$(document).keydown(function(e) {
    // Only move if proper key is used
    if (!game.freeze && _.includes([87, 65, 83, 68], e.which) && !game.player.walking) {
        e.preventDefault();
        game.player.move(e.which);
    }

    var elem = document.getElementById('game');
    // Full screen
    if (!game.freeze && e.which == 70) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
    }

    if (e.which == 81) {
        game.showFps = !game.showFps;
    }
});

document.addEventListener("webkitfullscreenchange", function () {
    game.isFullScreen = $("#game:-webkit-full-screen").length == 0 ? false : true;
    resize();
}, false);
