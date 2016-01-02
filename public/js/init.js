// Get server from play page
var server = $('server').html();
var UP = 87;
var DOWN = 83;
var RIGHT = 68;
var LEFT = 65;

// Set up socket
var socket = io(server);

// Canvas
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

// For model and tile info
var models;
var tiles;

var background = document.createElement("img");
background.src = "assets/world/surface.png";

$.get("editor/world/test world", function(data) {
    map = data;
    dim = map.maps.default.info.dimensions;
    src = map.maps.default.tiles;
    for (var i = 0; i < src.length; i++) {
      for (var j = 0; j < src[0].length; j++) {
        src[i][j] = new Tile(src[i][j].layers);
      }
    }

    tileset = new Image();
    tileset.src = "img/editor/sets/all.png";
    tileset.onload = function() {
        // Game is hidden until everything is loaded
        $("#game").hide();
        $(window).load(function() {
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

                /*
                game.logicLoop = setInterval(function() {
                    // Player logic
                    game.player.walk();

                    // Other players logic
                    for (key in this.players) {
                        // Don't render
                        //if ((game.players[key].x-game.player.x > -19 && game.players[key].x-game.player.x < 17) && (game.players[key].y-game.player.y < 17 && game.players[key].y-game.player.y > -19)) {
                            game.players[key].walk();
                        //}
                    }

                    // Update other players positions
                    game.updatePlayerPosses();
                }, 1000/60);

                */
            });
        });
    }
});

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
                //context.drawImage(background, (game.player.x - 17) * 16, (game.player.y - 17) * 16, (screen.width-(screen.width%16)), (screen.height-(screen.height%16)), 0, 0, (screen.width-(screen.width%16)), (screen.height-(screen.height%16)));
            });
            /*player.onload = function() {
            //context.drawImage(player, 0, -4);
            //player.src = "http://keitharm.me/pokemmon/keith/client/assets/sprites/player/male_1/"+dirstr+"_1.png";
            player = new Player("male_1", data.direction, data.x, data.y);
            }*/
        });
    });
});
resize();

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);

multiple_login = false;
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
