// Get server from play page
var server = $('server').html();
var freeze = true;
var UP = 87;
var DOWN = 83;
var RIGHT = 68;
var LEFT = 65;

// Game is hidden until everything is loaded
$("#game").hide();
$(window).load(function() {
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

        $('#loading').text('');
        // Allow player to move
        freeze = false;
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
    });
});

// Set up socket
var socket = io(server);

// Canvas
var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

// For model and tile info
var models;
var tiles;

// Resolution scale
context.scale(1, 1);

var background = document.createElement("img");
//background.src = "http://keitharm.me/pokemmon/keith/client/assets/world/surface.png";
background.src = "assets/world/surface.png";

// Load
socket.on('preData', function(data) {
    $.getJSON("js/models.json", function(modelData) {
        models = modelData;
        $.getJSON("js/tiles.json", function(tileData) {
            tiles = tileData;
            // Load player location data first before starting game since game depends on player's initial spot
            game = new Game({
                "server": server
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
//context.drawImage(background, map_x*16, map_y*16, 336, 336, 0, 0, 336, 336);
/*
$('canvas').drawImage({
source: 'http://keitharm.me/pokemmon/keith/server/combine.png',
x: 0, y: 0,
sWidth: 528,
sHeight: 528,
sx: (map_x*16+(game.x_diff*game.amt)), sy: (map_y*16+(game.y_diff*game.amt)),
cropFromCenter: false,
scale: 1
});
*/
resize();

function resize() {
    // Our canvas must cover full height of screen
    // regardless of the resolution
    //var height = window.innerHeight;
    // So we need to calculate the proper scaled width
    // that should work well with every resolution
    //var ratio = canvas.width / canvas.height;
    //var width = window.innerWidth;
    //canvas.style.width = (window.innerWidth-4) + 'px';
    //canvas.style.height = (window.innerHeight-4) + 'px';
    //$('#game').css('margin-left', Math.floor((width - 4) * .025));
    //$('#game').css('margin-top', Math.floor((height - 4) * .05));

    /*
    $('#game')
        .attr('width', screen.width*.6)
        .attr('height', screen.height*.8)
        .css('margin-left', screen.width*.2)
        .css('margin-top', screen.height*.2);
    */

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
/*
$(window).focus(function() {
game.resume();
})
.blur(function() {
game.pause();
context.save();
context.fillStyle = "rgba(0, 0, 0, 0.5)";
context.fillRect(0, 0, 528, 528);
context.restore();
context.font="20px Georgia";
context.fillStyle = 'white';
context.fillText("Game Paused",180,264);
});
*/
socket.on('error', function(data) {
    console.log(data);
});
