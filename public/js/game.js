function Game(options) {
    this.options = options;

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

    this.showFps = true;

    this.defaultDim = 512;
    this.old = false;
}

$(document).keydown(function(e) {
    // Only move if proper key is used
    if (!game.freeze && inArray(e.which, [87, 65, 83, 68]) && !game.player.walking) {
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

function inArray(value, array) {
  return array.indexOf(value) > -1;
}

Game.prototype.updatePlayerPosses = function() {
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

// Connects the game to the server and starts the update and render loops
Game.prototype.start = function(username, model, direction, x, y, callback) {
    // Push player object as first entity
    this.player = new Player(username, model, direction, x, y, true);

    this.connect();                     // Connects to the server

    this.startLogic();                  // Starts game logic loop

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

Game.prototype.logic = function() {

};

Game.prototype.drawFps = function() {
    context.save();
    context.fillStyle = "rgba(0, 0, 0, 0.65)";
    context.fillRect(0, 0, 512, 512);
    //context.fillRect(0, 20, 300, 20);
    context.restore();
    context.font = "16px Courier";
    context.fillStyle = 'yellow';

    var fps = Math.round(game.fps*10)/10;
    context.fillText(fps + (fps % 1 != 0 ? "" : ".0") + " FPS | walkingFrame: " + zeroPad(this.player.walkingFrame, 10) + " | currentFrame: " + this.frame, 0, 15);
    context.fillText("Player: [" + this.player.x + ", " + this.player.y + "][" + this.x + ", " + this.y + "][" + this.player.amt + "]{" + this.player.direction + "}" , 0, 35);
    context.fillText("Origin coords: [" + this.raw_x + ", " + this.raw_y + "] [" + Math.round(this.raw_x/16) + ", " + Math.round(this.raw_y/16) + "]", 0, 55);
    context.fillText("toRender sum: " + this.toRender.reduce(function(a, b) { return a + b; }) + " | contains negatives: " + (this.toRender.indexOf(-1) === 1) , 0, 75);
    context.fillText("Clients connected: " + Object.keys(this.playerData).length, 0, 95);
    context.fillText("Sx, Sy, Sw, Sh, Dx, Dy, Dw, Dh", 0, 115);
    context.fillText(this.tilesThing[0], 0, 135);
    context.fillText(this.tilesThing[1], 0, 155);
    context.fillText(this.tilesThing[2], 0, 175);

    function zeroPad(nr,base){
      var  len = (String(base).length - String(nr).length)+1;
      return len > 0? new Array(len).join('0')+nr : nr;
    }
};

// Game rendering loop
Game.prototype.render = function(time) {
    if (!this.oldTime)
        this.oldTime = time;

    this.deltaTime = Math.min(1000, time - this.oldTime);
    this.oldTime = time;

    this.calcFps();             // Calculates the fps for utility.

    // Render background first
    var height = Math.floor(((game.isFullScreen) ? screen.height : window.innerHeight)/16)*16;
    var width = Math.floor(((game.isFullScreen) ? screen.width : window.innerWidth)/16)*16;

    this.dim = Math.min(height, width);
    while (this.dim > this.defaultDim) {
        this.dim-=16;
    }
    this.renderTiles();

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

Game.prototype.renderTiles = function() {
    this.raw_x = (this.player.x-(this.dim/16/2))*16 + (this.player.x_diff*this.player.amt);
    this.raw_y = (this.player.y-(this.dim/16/2))*16 + (this.player.y_diff*this.player.amt);
    this.dim = this.dim;

    this.x = Math.floor(this.raw_x/16)
    this.y = Math.floor(this.raw_y/16)
    this.toRender = [0];
    this.tilesThing = [];

    if (!this.old) {
        //console.log(x,y);
        for (var i = game.player.y-16-1, a = -1; i < 33+game.player.y-16; i++, a++) {
            for (var j = game.player.x-16-1, b = -1; j < 33+game.player.x-16; j++, b++) {
                if (i === 0 && j === 0 && this.frame%60 === 0) {
                    console.log(16*j+(this.player.x_diff*this.player.amt), 16*i+(this.player.y_diff*this.player.amt));
                }
                tile = this.getTile([i,j]);
                this.toRender.push(tile.getLayer(1));
                this.tilesThing.push(((tile.getLayer(2) % 16) * 16) + ", " +  (Math.floor(tile.getLayer(1) / 16) * 16) + ", " + 16 + ", " + 16 + ", " + (16*j+(this.player.x_diff*this.player.amt)) + ", " + (16*i+(this.player.y_diff*this.player.amt)) + ", 16, 16");
                context.drawImage(tileset, (tile.getLayer(1) % 16) * 16, Math.floor(tile.getLayer(1) / 16) * 16, 16, 16, 16*b-(this.player.x_diff*this.player.amt), 16*a-(this.player.y_diff*this.player.amt), 16, 16);
                context.drawImage(tileset, (tile.getLayer(2) % 16) * 16, Math.floor(tile.getLayer(2) / 16) * 16, 16, 16, 16*b-(this.player.x_diff*this.player.amt), 16*a-(this.player.y_diff*this.player.amt), 16, 16);
            }
        }
    } else {
        //console.log(x, y, dim/16, dim/16, 0, 0, dim/16, dim/16);
        context.drawImage(background, this.raw_x, this.raw_y, this.dim, this.dim, 0, 0, this.dim, this.dim);
    }

};

Game.prototype.getTile = function(x, y) {
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

Game.prototype.startLogic = function() {
    var self = this;
    this.logicLoop = setInterval(function() {
        // Player logic
        self.player.walk();

        // Other players logic
        for (key in self.players) {
            // Don't render
            //if ((self.players[key].x-self.player.x > -19 && self.players[key].x-self.player.x < 17) && (self.players[key].y-self.player.y < 17 && self.players[key].y-self.player.y > -19)) {
                self.players[key].walk();
            //}
        }

        // Update other players positions
        self.updatePlayerPosses();
    }, 1000/60);
}