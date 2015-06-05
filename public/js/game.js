function Game(options) {
    // this.dom = this.build();        // The root of the game in the DOM. When creating new elements, append to this.dom
    this.options = options;

    this.bufA = {};                 // Used by render
    this.bufB = {};                 // Used by update/logic
    this.dirty = false;             // Used to signal when updates should be pulled from bufB to bufA

    this.oldTime;                   // Used to calculate deltaTime
    this.deltaTime;                 // In milliseconds

    this.fps = 60;                   // Used for utility to see the current fps
    this.fps_time = 0;
    this.fps_ticks = 0;
    this.fps_delta = 500;          // The number of milliseconds to average frames over
    this.frame = 0;

    this.entities = [];
    this.players = [];

    this.playerData = $.parseJSON("{}");

    this.isFullScreen = false;

    this.logicLoop = "";

    this.showFps = false;

    this.defaultDim = 512;

    // this.cache = // TODO Need to implement a cache for canvas
}

/*
keys = {};
$(document).keydown(function(event){

    keys[event.which] = true;
    if (!game.player.walking) {
        game.player.move(event.which);
    }
}).keyup(function(event){
    delete keys[event.which];
});
*/

$(document).keydown(function(e) {
    // Only move if proper key is used
    if (!freeze && inArray(e.which, [87, 65, 83, 68]) && !game.player.walking) {
        e.preventDefault();
        game.player.move(e.which);
    }

    var elem = document.getElementById('game');
    // Full screen
    if (!freeze && e.which == 70) {
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

function inArray(value, array) {
  return array.indexOf(value) > -1;
}



Game.prototype.updatePlayerPosses = function updatePlayerPosses() {
    // Remove players not in playerdata list
    $.each(game.playerData, function(key) {
        if (typeof game.players[key] == "undefined") {
            delete(game.players[key]);
        }
    });

    $.each(game.playerData, function(key, item) {
        if (key == game.player.username) {
            return true;
        }
        // If player object isn't in game.players array, add it
        // If already in array, update info
        if (!(key in game.players)) {
            game.players[key] = new Player(key, item["model"], item["direction"], item["x"], item["y"])
        } else {
            // If previous coords are different from the new coords, run the walk animation
            if (!game.players[key].walking && (game.players[key]["x"] != item["x"] || game.players[key]["y"] != item["y"])) {
                game.players[key].move(item["direction"]);
            }
            game.players[key].setPos(item["x"], item["y"], item["direction"]);
        }
    });
}


// Averages the fps of the last "maxFrames" frames
// Smoothness can be adjusted dynamically by adjusting maxFrames value
// Call this every frame
Game.prototype.calcFps = function() {
    if (this.deltaTime == 0)
        return;

    this.fps_time += this.deltaTime;
    this.fps_ticks++;
    this.frame++;

    if (this.fps_time >= this.fps_delta) {
        this.fps = this.fps_ticks/this.fps_time * 1000;
        this.fps_ticks = this.fps_time = 0;
        $("#fps").html(Math.round(this.fps*100)/100 + " fps");
    }
};

// Create the root from which game elements will be created and removed
Game.prototype.build = function() {
    var div = document.createElement("div");

    div.setAttribute("class", "game");
    document.body.appendChild(div);

    return div;
};

// Connects the game to the server and starts the update and render loops
Game.prototype.start = function(username, model, direction, x, y, callback) {
    // Push player object as first entity
    this.player = new Player(username, model, direction, x, y, true);

    this.connect();                     // Connects to the server

    this.logic();                       // Sets up game logic

    requestAnimationFrame(this.render.bind(this)); // Has an animation loop

    callback();
};

Game.prototype.pause = function() {
    cancelAnimationFrame(game.loop);
}

Game.prototype.resume = function() {
    game.loop = requestAnimationFrame(this.render.bind(this));
}

Game.prototype.connect = function() {
    this.socket = io(this.options.server);
}

// Set up event based game logic here
// this.dirty is set to false within these socket events
Game.prototype.logic = function() {
    // Example of how an update event would look like
    // Nothing in this example should be changed except for the 
    // event that the socket is waiting on and the arguments of the handler
    // Also the comment in the middle of the handler should be replaced with 
    // update code
    this.socket.on('', function(data) {
        if(!dirty) {
            this.bufB = {};
            dirty = true;
        }

        // Store all information inside of this.bufB
    });


    // TODO Keybindings and mouseevents need to be tied with this.socket.emit
    // https://github.com/tzuryby/jquery.hotkeys for examples
};

Game.prototype.drawFps = function() {
    context.save();
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, 50, 20);
    context.restore();
    context.font = "20px Courier";
    context.fillStyle = 'yellow';
    var fps = Math.round(game.fps*10)/10;
    context.fillText(fps + (fps % 1 != 0 ? "" : ".0"), 0, 15);
};

// Game rendering loop
Game.prototype.render = function(time) {
    if (!this.oldTime)
        this.oldTime = time;

    this.deltaTime = Math.min(1000, time - this.oldTime);
    this.oldTime = time;

    this.calcFps();             // Calculates the fps for utility.

    if (this.dirty) {
        this.bufA = this.bufB;  // Moves updates from bufB to bufA
        this.dirty = false;
    }

    // Render background first
    var height = Math.floor(((game.isFullScreen) ? screen.height : window.innerHeight)/16)*16;
    var width = Math.floor(((game.isFullScreen) ? screen.width : window.innerWidth)/16)*16;

    this.dim = Math.min(height, width);
    while (this.dim > this.defaultDim) {
        this.dim-=16;
    }

    context.drawImage(background, (this.player.x-(this.dim/16/2))*16 + (this.player.x_diff*this.player.amt), (this.player.y-(this.dim/16/2))*16 + (this.player.y_diff*this.player.amt), this.dim, this.dim, 0, 0, this.dim, this.dim);

    // Player render
    this.player.render();

    // Other players render
    for (key in this.players) {
        if ((game.players[key].x-game.player.x > -19 && game.players[key].x-game.player.x < 17) && (game.players[key].y-game.player.y < 17 && game.players[key].y-game.player.y > -19)) {
            game.players[key].render();
        }
    }

    if (this.showFps) this.drawFps();

    // TODO Rendering stuff goes here. All update data will be found in this.bufA
    // Access delta time though this.time.deltaTime
    // Do not put anything else anywhere else in this function except for where this comment is.

    game.loop = requestAnimationFrame(this.render.bind(this));
};
