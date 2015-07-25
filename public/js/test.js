$(function() {
  var canvas_width  = 512;
  var canvas_height = 512;
  scale             = 16;
  var tile_dim      = 16;
  playerPos         = [0, 0];

  window.mouse = {down: false, x: 0, y: 0, hover_x: 0, hover_y: 0, prev_x: 0, prev_y: 0};

  $('body').prepend('<canvas id="game" width="' + canvas_width + '" height="' + canvas_height + '" style="display: inline; width: ' + canvas_width + '; height: ' + canvas_height + '; margin-left: 464px; margin-top: 8px;"></canvas>');

  var canvas = document.getElementById('game');
  var context = canvas.getContext('2d');

  img = new Image();
  img.src = "http://keith.keitharm.me/img/editor/sets/all.png";

  context.fillStyle="#000";
  context.fillRect(0, 0, canvas_width, canvas_height);

  x_offset = -playerPos[0]*scale;
  y_offset = -playerPos[1]*scale;

  // Centering
  x_offset += canvas_width/2;
  y_offset += canvas_height/2;

  function updatePos(x, y) {
    playerPos = [x, y];
    x_offset = -playerPos[0]*scale;
    y_offset = -playerPos[1]*scale;

    x_offset += canvas_width/2;
    y_offset += canvas_height/2;

    renderAroundPlayer();
  }

  updatePlayerPosByOffset = function updatePlayerPosByOffset() {
    var x = x_offset - canvas_width/2;
    var y = y_offset - canvas_height/2;

    playerPos[0] = -Math.round((x_offset-canvas_width/2)/scale);
    playerPos[1] = -Math.round((y_offset-canvas_height/2)/scale);

    renderAroundPlayer();
  };

  img.onload = function() {
    window.map = null;
    $.getJSON("editor/world/world", function(data) {
      map = data.maps.surface.tiles;
      renderAroundPlayer();
    });
  };

  function drawTile(id, x, y) {
    context.drawImage(img, (id % tile_dim) * tile_dim, Math.floor(id / tile_dim) * tile_dim, tile_dim, tile_dim, x * scale + x_offset, y * scale + y_offset, scale, scale);
  }

  renderAroundPlayer = function renderAroundPlayer() {
    context.fillStyle="#000";
    context.fillRect(0, 0, canvas_width, canvas_height);

    var viewport_height = canvas_width;
    var viewport_width  = canvas_height;

    var viewport_tile_height = viewport_height/scale;
    var viewport_tile_width  = viewport_width/scale;

    var half_height = viewport_height/2/scale;
    var half_width  = viewport_width/2/scale;

    render = [];


    // Determine the tiles to render starting from top left corner
    for (var a = playerPos[1]-half_height; a < playerPos[1]-half_height+viewport_tile_height; a++) {
      for (var b = playerPos[0]-half_width; b < playerPos[0]-half_width+viewport_tile_width; b++) {
        // Ignore negative tiles and ignore tiles larger than map
        if ((a < 0 || b < 0) || (a >= map.length || b >= map[0].length)) {
          continue;
        } else {
          render.push([a, b]);
        }
      }
    }

    // Calculate min/max x/y
    bounds = {
      largest: {
        x:  Math.max.apply(null, render.map(function(item) {
          return item[0];
        })),
        y:  Math.max.apply(null, render.map(function(item) {
          return item[1];
        }))
      },
      smallest: {
        x:  Math.min.apply(null, render.map(function(item) {
          return item[0];
        })),
        y:  Math.min.apply(null, render.map(function(item) {
          return item[1];
        }))
      }
    };

    // Push raw_padding
    // Raw padding is not sanitized

    // Top
    start = [bounds.smallest.x-1, bounds.smallest.y-1];
    end   = [bounds.largest.x+1, bounds.largest.y+1];

    raw_padding = [];


    // Top and Bottom
    for (var i = start[0]; i <= end[0]; i++) {
      raw_padding.push([i, start[1]]); // Top
      raw_padding.push([i, end[1]]); // Bottom
    }

    // Left and Right
    for (var i = start[1]; i <= end[1]; i++) {
      raw_padding.push([end[0], i]);   // Right
      raw_padding.push([start[0], i]); // Left
    }

    // Sanitize padding
    padding = [];
    raw_padding.forEach(function(coords) {
      if (coords[0] >= 0 && coords[0] < map[0].length && coords[1] >= 0 && coords[1] < map.length) {
        padding.push(coords);
      }
    });

    render = render.concat(padding);  // Add padding to rendering tiles

    render.forEach(function(tile) {
      var layers = map[tile[0]][tile[1]].layers;
      if (layers.length != 1) {
        layers.forEach(function(layer) {
          drawTile(layer, tile[1], tile[0]);
        });
      } else {
        drawTile(layers[0], tile[1], tile[0]);
      }
    });
  };

  $('#game')[0].addEventListener('mousedown', function(e){
      mouse.down = true;
      $("#game").css("cursor", "-webkit-grabbing");

      mouse.prev_x = e.offsetX-x_offset;
      mouse.prev_y = e.offsetY-y_offset;
  });

  $('#game')[0].addEventListener('mouseup', function(e){
      mouse.down = false;
      $("#game").css("cursor", "-webkit-grab");
  });

  $('#game')[0].addEventListener('mousemove', function(e){
      mouse.x       = e.offsetX-x_offset;
      mouse.y       = e.offsetY-y_offset;
      mouse.hover_x = Math.floor(mouse.x/(tile_dim));
      mouse.hover_y = Math.floor(mouse.y/(tile_dim));

      if (mouse.down) {
        // Record difference
        var x_diff = e.offsetX-x_offset - mouse.prev_x;
        var y_diff = e.offsetY-y_offset - mouse.prev_y;

          x_offset += x_diff;
          y_offset += y_diff;

        /*
        if (x_offset + x_diff <= 256 && Math.abs(x_offset + x_diff) <= map.length*scale-canvas_width/2) {
          x_offset += x_diff;
        }
        if (y_offset + y_diff <= 256 && Math.abs(y_offset + y_diff) <= map[0].length*scale-canvas_height/2) {
          y_offset += y_diff;
        }
        */

          // Update
          mouse.prev_x = e.offsetX-x_offset;
          mouse.prev_y = e.offsetY-y_offset;

          updatePlayerPosByOffset();
      }
  });

  $('#game')[0].addEventListener('mouseleave', function(e){
      mouse.down = false;
  });
});
