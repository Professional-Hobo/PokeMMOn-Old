(function($) {
    function Game(options) {
        options = options || {};

        this.server = options.server;
        this.socket = options.socket;

        this.maxFps = options.maxFps ? options.maxFps : 60;
        this.fps = 0;
        this.framesPerUpdate = 0;
        this.lastFpsUpdate = 0;
        this.fpsInterval = options.fpsInterval ? options.fpsInterval : 500;
        this.setFpsDecay(options.fpsDecay);

        this.delta = 0;
        this.lastFrameTime = 0;
        this.timestep = 1000/(this.maxFps);
        this.panicLimit = 240;        // Once the number of timestep chunks to be recovered surpasses this, panic() will
                                      // be called

// ------------------------------------------------------------------------------------------------------------------ //

        this.entities = [];
        this.players = [];

        this.playerData = {};

        this.isFullScreen = false;

        this.showFps = true;

        this.dim = 512;
    }

    Game.prototype.setFps = function(fps) {
        this.maxFps = fps;
        this.timestep = 1000/fps;
    }

    Game.prototype.setFpsDecay = function(decay) {
        if (decay > 1 || decay <= 0 || decay == undefined) {
            this.fpsDecay = .40;
        } else {
            this.fpsDecay = decay;
        }
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

    // Averages the fps of the last "fpsInterval" milliseconds
    // Smoothness can be adjusted dynamically by adjusting fpsInterval and fpsDecay (use setFpsDecay(decay))
    // Call this every frame
    Game.prototype.calcFps = function(time) {
        if (time > this.lastFpsUpdate + this.fpsInterval) {
            this.fps = (this.fpsDecay * this.framesPerUpdate + (1 - this.fpsDecay) * this.fps * this.fpsInterval/1000) *
                       1000/this.fpsInterval;
            this.lastFpsUpdate = time;
            this.framesPerUpdate = -1;
        }

        ++this.framesPerUpdate;
    };

    // Starts the update and render loops
    Game.prototype.start = function(username, model, direction, x, y, callback) {
        // Push player object as first entity
        this.player = new Player(username, model, direction, x, y, true);

        this.startLogic();                  // Starts game logic loop

        requestAnimationFrame(this.render.bind(this)); // Has an animation loop

        callback();
    };

    Game.prototype.pause = function() {
        cancelAnimationFrame(this.loop);
    }

    Game.prototype.resume = function() {
        this.loop = requestAnimationFrame(this.render.bind(this));
    }

    Game.prototype.drawFps = function() {
        context.save();
        context.fillStyle = "rgba(0, 0, 0, 0.4)";
        context.fillRect(0, 0, 512, 512);
        //context.fillRect(0, 20, 300, 20);
        context.restore();
        context.font = "16px Courier";
        context.fillStyle = 'yellow';

        var fps = Math.round(game.fps*10)/10;
        context.fillText(fps + (fps % 1 != 0 ? "" : ".0") + " FPS | walkingFrame: " + zeroPad(this.player.walkingFrame, 10), 0, 15);
        context.fillText("Player: [" + this.player.x + ", " + this.player.y + "][" + this.x + ", " + this.y + "][" + this.player.amt + "]{" + this.player.direction + "}" , 0, 35);
        context.fillText("Origin coords: [" + this.raw_x + ", " + this.raw_y + "] [" + Math.round(this.raw_x/16) + ", " + Math.round(this.raw_y/16) + "]", 0, 55);
        context.fillText("Clients connected: " + Object.keys(this.playerData).length, 0, 75);
        context.fillText("Total quadrants: " + (canvases.length*canvases[0].length) + " @ " + canvases[0][0].width + "px x " + canvases[0][0].height + "px", 0, 95);

        function zeroPad(nr,base){
          var  len = (String(base).length - String(nr).length)+1;
          return len > 0? new Array(len).join('0')+nr : nr;
        }
    };

    Game.prototype.panic = function() {
        this.delta = 0;
    }

    // Game rendering loop
    Game.prototype.render = function(time) {
        if (time - this.lastFrameTime < this.timestep) {
            this.loop = requestAnimationFrame(this.render.bind(this));
            return;
        }

        this.delta += time - this.lastFrameTime;
        this.lastFrameTime = time - ((time - this.lastFrameTime) % this.timestep);

        this.calcFps(time);

        var numUpdateSteps = 0;
        while (this.delta >= this.timestep) {
            //update(timestep);  // calculate the positions of everything
            this.delta -= this.timestep;
            if (++numUpdateSteps >= this.panicLimit) {
                this.panic();
                break;
            }
        }

        // render();    // draw everything to the positions indicated by the update function

        // Render background first
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

        this.loop = requestAnimationFrame(this.render.bind(this));
    };

    Game.prototype.renderTiles = function() {
        this.raw_x = (this.player.x-(this.dim/16/2))*16 + (this.player.x_diff*this.player.amt);
        this.raw_y = (this.player.y-(this.dim/16/2))*16 + (this.player.y_diff*this.player.amt);
        this.dim = this.dim;

        this.x = Math.floor(this.raw_x/16)
        this.y = Math.floor(this.raw_y/16)
        this.toRender = [0];
        this.tilesThing = [];

        for (var i = 0; i < canvases.length; i++) {
            for (var j = 0; j < canvases[0].length; j++) {
                context.drawImage(canvases[i][j], this.raw_x-size*16*i, this.raw_y-size*16*j, this.dim, this.dim, 0, 0, this.dim, this.dim);
            }
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

    window.Game = Game;
})(jQuery);
