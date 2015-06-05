function Entity(model, direction, x, y) {
    this.walking = false;
    this.walkingFrame = 0;
    this.dirs = ["up", "right", "down", "left"];
    this.walkAnimFrame = 1;
    this.amt = 0;
    this.animationFrameStep = 2;
    this.model = model;
    this.direction = direction;
    this.x = x;
    this.y = y;
    this.speed = 250;
    this.pixels = 16;
    this.interval = 0;
    this.stages = [];
    this.sprite = document.createElement("img");
    this.sprite.src = "assets/sprites/" + this.model + "/" + this.direction + "_" + this.walkAnimFrame + ".png";
    this.x_diff = 0;
    this.y_diff = 0;
}

Entity.prototype.setPos = function setPos(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
};

Entity.prototype.move = function move(direction) {
    this.walking = true;
    this.walkingFrame = 0;
    this.x_diff = 0;
    this.y_diff = 0;
    this.amt = 0;

    if (direction == UP) {
        this.y_diff = -1;
        this.direction = this.dirs[0];
    } else if (direction == RIGHT) {
        this.x_diff = 1;
        this.direction = this.dirs[1];
    } else if (direction == DOWN) {
        this.y_diff = 1;
        this.direction = this.dirs[2];
    } else if (direction == LEFT) {
        this.x_diff = -1;
        this.direction = this.dirs[3];
    }
    var self = this;
    this.calcInterval(function() {
        self.walking = true;
    });

    // "http://keitharm.me/pokemmon/keith/client/assets/sprites/player/" + this.model + "/" + this.direction + "_" + this.walkAnimFrame + ".png";
};

// Calculates how fast the player should move based off of the users fps
Entity.prototype.calcInterval = function calcInterval(callback) {
    // 16/(60/(1000/250))
    // Player has to move total of 16 pixels in ^ frames assuming 60 fps and 250 ms in ^ example.
    var amt = 0;
    var total = 0;
    var temp = 0;
    var alt = false;
    var prev = false;
    this.stages = [];

    if (game.fps == 0) {
        return;
    }

    this.interval = 1/(game.fps/(1000/this.speed)/this.pixels);
    if (this.interval > 1) {
        amt = Math.round(this.interval);
    } else {
        // Alternate between 1 and 0 to even out
        alt = true;
        amt = this.interval;
    }

    do {
        while (total + amt > this.pixels && !alt) {
            amt--;
        }
        if (alt == true) {
            temp = Math.round(total % 1);
            if (temp == 1 && !prev) {
                prev = true;
                this.stages.push(1);
            } else {
                if (temp == 0) {
                    prev = false;
                }
                this.stages.push(0);
            }
            total += amt;
        } else {
            this.stages.push(amt);
            total += amt;
        }
    } while (total < this.pixels);

    // Count up ones and do further calculations of conditions not met
    var fix = 0;
    var zeros = [];
    var sum = 0;
    var count = this.stages.filter(function(total){
      return (total == 1);
    }).length;

    // Calculate sum
    $.each(this.stages, function(key, item) {
        sum += item
    });

    if (count < this.pixels && sum != this.pixels) {
        fix = this.pixels - count;
    }

    $.each(this.stages, function(key, item) {
        if (item == 0) {
            zeros.push(key);
        }
    });

    shuffle(zeros);

    for (var i = 0; i < fix; i++) {
        this.stages[zeros[i]] = 1;
    }

    callback();

};

// "Moves" the player by moving the background image
Entity.prototype.walk = function walk() {
    // If player isn't currently walking, do nothing
    if (!this.walking) {
        return;
        //return "Not walking";
    }

    if (this.walkingFrame++ < this.stages.length) {
        if (this.walkingFrame < Math.round((this.stages.length/3)*2)) {
            this.walkAnimFrame = this.animationFrameStep;
        } else {
            this.walkAnimFrame = 1;
        }
        this.sprite.src = "assets/sprites/" + this.model + "/" + this.direction + "_" + this.walkAnimFrame + ".png";
        this.amt += this.stages[this.walkingFrame];
        //context.clearRect ( 0 , 0 , canvas.width, canvas.height );
        //context.drawImage(player, (map_x-17)*16+(game.x_diff*game.amt), (map_y-17)*16+(game.y_diff*game.amt), 528, 528, 0, 0, 528, 528);
        //context.clearRect ( 0 , 0 , canvas.width, canvas.height );
        //context.drawImage(background, (map_x-17)*16+(this.x_diff*this.amt), (map_y-17)*16+(this.y_diff*this.amt), 528, 528, 0, 0, 528, 528);
        game.offsetX = (map_x-17)*16+(game.x_diff*game.amt);
        game.offsetY = (map_y-17)*16+(game.y_diff*game.amt);
        //context.drawImage(player, 272, 268);
        //context.drawImage(background, map_x*16+(game.x_diff*game.amt), map_y*16+(game.y_diff*game.amt), 336, 336, 0, 0, 336, 336);
        //context.drawImage(player, 272, 268);
        //context.drawImage(player, 160, 156);
        //return "Currently walking";
        
    } else {
        if (this.walkingFrame > this.stages.length) {
            this.animationFrameStep = this.animationFrameStep == 2 ? 3 : 2;
            map_x += this.x_diff;
            map_y += this.y_diff;
            this.walkingFrame = 0;
            this.x_diff = 0;
            this.y_diff = 0;
            this.amt = 0;
            this.walking = false;

            // Send updated coords to server
            socket.emit('locationUpdate', {zone: "towny", x: map_x, y: map_y, direction: this.direction});

            //return "Finished walking";
        }
    }
};

Entity.prototype.render = function render() {
    context.drawImage(this.sprite, 272, 268);
}

function shuffle(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}