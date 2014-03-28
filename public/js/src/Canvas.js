var Game = (function(Game) {
  var ctx
    , message = {}
    , lifeImg = new Image();

  lifeImg.src = '/images/ship_normal.png';

  Game.Canvas = {
    init: function(canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');

      window.onresize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      Object.defineProperty(Game.Canvas, 'width', {
        get: function() { return canvas.width; }
      });

      Object.defineProperty(Game.Canvas, 'height', {
        get: function() { return canvas.height; }
      });
    },

    showMessage: function(title, detail, secs) {
      if (secs === undefined) {
        if (typeof detail === "number") {
          secs = detail;
          detail = '';
        } else {
          secs = 0;
        }
      }

      detail = detail || '';

      message = {
        title: title,
        detail: detail
      };

      if (secs > 0) {
        setTimeout(function() {
          message = {};
        }, 1000*secs);
      }
    },

    clearMessage: function() {
      message = {};
    },

    clear: function() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, Game.Canvas.width, Game.Canvas.height);
    },

    drawSimple: function(objects) {
      objects.forEach(function(obj) {
        var img = obj.render()
          , x = obj.x || 0
          , y = obj.y || 0;

        x = ((x % Game.Canvas.width) + Game.Canvas.width) % Game.Canvas.width;
        y = ((y % Game.Canvas.height) + Game.Canvas.height) % Game.Canvas.height;

        ctx.drawImage(img, x, y);
      });
    },

    drawComplex: function(objects) {
      objects.forEach(function(obj) {
        var img = obj.render()
          , x = obj.x || 0
          , y = obj.y || 0
          , w = obj.width || 0
          , h = obj.height || 0
          , sx = obj.scale || 1
          , sy = obj.scale || 1
          , angle = obj.angle || 0;

        obj.x = ((x % Game.Canvas.width) + Game.Canvas.width) % Game.Canvas.width;
        obj.y = ((y % Game.Canvas.height) + Game.Canvas.height) % Game.Canvas.height;
        obj.angle = ((angle % (2*Math.PI)) + (2*Math.PI)) % (2*Math.PI);

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.angle);
        ctx.scale(sx, sy);
        ctx.translate(-0.5*sx*w, -0.5*sy*h);
        ctx.drawImage(img, 0, 0);

        if (Game.debug.drawOutlines) {
          ctx.strokeStyle = '#ff0';
          ctx.lineWidth = 2;
          ctx.strokeRect(0, 0, w, h);
        }

        ctx.restore();
      });
    },

    drawHUD: function(player) {
      var i;

      drawHealth(player.ship.health, 30, 60, 100, 10);
      drawLives(player.lives, 0, 0, 0.5);
      drawItems(player.items, Game.Canvas.width, 20, 0.75);

      if (message.title !== undefined) {
        drawMessage();
      }
    },

    drawFrameCount: function(frame) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(frame, 0, 10);
    }

  };

  function drawHealth(health, x, y, width, height) {
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, width*(0.01*health), height);
  };

  function drawLives(numLives, x, y, scale) {
    for (var i = 0; i < numLives; i++) {
      ctx.save();
      ctx.translate(x + 30*i, y);
      ctx.rotate(-0.5*Math.PI);
      ctx.translate(-0.5*lifeImg.width, 0.5*lifeImg.height);
      ctx.scale(scale, scale);
      ctx.drawImage(lifeImg, 0, 0);
      ctx.restore();
    }
  }

  function drawItems(items, x, y, scale) {
    var img;

    for (var i = 0; i < items.length; i++) {
      img = items[i].render();
      ctx.save();
      ctx.translate(x - 0.5*img.width*i - img.width, y);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }
  }

  function drawMessage() {
    var centerX = 0.5*Game.Canvas.width
      , centerY = 0.5*Game.Canvas.height
      , boxHeight = 60;

    if (message.detail !== '') {
      boxHeight += 48;
    }

    ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    ctx.fillRect(0, centerY - 34, Game.Canvas.width, boxHeight);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message.title, centerX, centerY, 600);

    ctx.font = '22px Arial';
    ctx.fillText(message.detail, centerX, centerY + 48);
  }

  return Game;
})(Game || {});
