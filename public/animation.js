var canvas = $('#test')[0];
var context = canvas.getContext('2d');

var model = "girl_1";
var action  = "swim";
var dirNum = 0;

loadAnimations(function() {

  context.imageSmoothingEnabled = false;
  context.scale(2,2);

  animFrame = 0;
  frame = 0;
  
  setInterval(function() {
    steps = models[model][action];
    maxFrame = steps.frames.total;
    per = steps.frames.per;
    dirs = Object.keys(steps.dirs);
    height = steps.dim.height;
    section = steps.section;

    if (animFrame === maxFrame) {
      animFrame = 0;
    }

    if (dirs[0] === "default") {
      dir = "default";
      dirNum = 0;
    } else {
      dir = dirs[Math.floor(animFrame/per)];
    }

    context.clearRect(0, 0, 1024, 1024);
    context.drawImage(sprites, (animFrame - Math.floor(animFrame/per)*per) * section + steps.dirs[dir].x, steps.dirs[dir].y, section, height, 0, 0, section, height);

    animFrame++;
    frame++;
  }, 1000/3);
});

function loadAnimations(cb) {
  sprites = new Image();
  sprites.src = "assets/sprites/player/spritesheet.png";
  sprites.onload = function() {
    models = {"boy_1": {"walk": {"dim": {"width": 168, "height": 21 }, "frames": {"total": 12, "per": 3 }, "section": 14, "dirs": {"down": {"x": 0, "y": 111 }, "up": {"x": 42, "y": 111 }, "right": {"x": 84, "y": 111 }, "left": {"x": 126, "y": 111 } } }, "run": {"dim": {"width": 180, "height": 20 }, "frames": {"total": 12, "per": 3 }, "section": 15, "dirs": {"down": {"x": 0, "y": 51 }, "up": {"x": 45, "y": 51 }, "right": {"x": 90, "y": 51 }, "left": {"x": 135, "y": 51 } } }, "wheelie": {"dim": {"width": 166, "height": 26 }, "frames": {"total": 8, "per": 2 }, "section": 21, "dirs": {"down": {"x": 0, "y": 135 }, "up": {"x": 42, "y": 135 }, "right": {"x": 84, "y": 135 }, "left": {"x": 126, "y": 135 } } }, "bike": {"dim": {"width": 264, "height": 23 }, "frames": {"total": 12, "per": 3 }, "section": 22, "dirs": {"down": {"x": 0, "y": 0 }, "up": {"x": 66, "y": 0 }, "right": {"x": 132, "y": 0 }, "left": {"x": 198, "y": 0 } } }, "catch": {"dim": {"width": 100, "height": 21 }, "frames": {"total": 5, "per": 5 }, "section": 20, "dirs": {"default": {"x": 0, "y": 26 } } }, "swim": {"dim": {"width": 100, "height": 29 }, "frames": {"total": 4, "per": 1 }, "section": 25, "dirs": {"down": {"x": 0, "y": 74 }, "up": {"x": 25, "y": 74 }, "right": {"x": 50, "y": 74 }, "left": {"x": 75, "y": 74 } } }, }, "girl_1": {"walk": {"dim": {"width": 168, "height": 20 }, "frames": {"total": 12, "per": 3 }, "section": 14, "dirs": {"down": {"x": 268, "y": 111 }, "up": {"x": 310, "y": 111 }, "right": {"x": 352, "y": 111 }, "left": {"x": 394, "y": 111 } } }, "run": {"dim": {"width": 190, "height": 19 }, "frames": {"total": 12, "per": 3 }, "section": 16, "dirs": {"down": {"x": 271, "y": 51 }, "up": {"x": 319, "y": 51 }, "right": {"x": 367, "y": 51 }, "left": {"x": 415, "y": 51 } } }, "wheelie": {"dim": {"width": 166, "height": 24 }, "frames": {"total": 8, "per": 2 }, "section": 21, "dirs": {"down": {"x": 269, "y": 133 }, "up": {"x": 311, "y": 133 }, "right": {"x": 353, "y": 133 }, "left": {"x": 395, "y": 133 } } }, "bike": {"dim": {"width": 264, "height": 23 }, "frames": {"total": 12, "per": 3 }, "section": 22, "dirs": {"down": {"x": 271, "y": 0 }, "up": {"x": 337, "y": 0 }, "right": {"x": 403, "y": 0 }, "left": {"x": 469, "y": 0 } } }, "catch": {"dim": {"width": 100, "height": 22 }, "frames": {"total": 5, "per": 5 }, "section": 20, "dirs": {"default": {"x": 271, "y": 25 } } }, "swim": {"dim": {"width": 104, "height": 28 }, "frames": {"total": 4, "per": 1 }, "section": 26, "dirs": {"down": {"x": 269, "y": 75 }, "up": {"x": 295, "y": 75 }, "right": {"x": 321, "y": 75 }, "left": {"x": 347, "y": 75 } } }, }, "male_1": {"name": "male_1", "offset_x": 0, "offset_y": -4 }, "female_1": {"name": "female_1", "offset_x": 1, "offset_y": -4 } };
    cb();
  };
}