var Game = (function(Game) {

  var that = this
    , canvas, ctx
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , wormholes = {}
    , gameLoop
    , canvas
    , message = {}
    , lifeImg = new Image();

  lifeImg.src = '/images/ship_normal.png';

  Game.playing = false;
  Game.frame = 0;
  Game.lives = 3;
  Game.width = 0;
  Game.height = 0;
  Game.debug = {
    drawOutlines: false
  };

  Game.init = function(id) {
    var i, x, y, dist;

    // set up prototype chain here to avoid parallel loading bug
    Game.Explosion.prototype = Game.GameObject;
    Game.Ship.prototype = Game.GameObject;
    Game.Missile.prototype = Game.GameObject;
    Game.Nuke.prototype = Game.GameObject;
    Game.Wormhole.prototype = Game.GameObject;
    Game.Item.prototype = Game.GameObject;

    canvas = document.getElementById(id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    window.onresize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    Object.defineProperty(Game, 'width', {
      get: function() { return canvas.width; }
    });

    Object.defineProperty(Game, 'height', {
      get: function() { return canvas.height; }
    });

    for (i = 0; i < 0.0005*canvas.width*canvas.height; i++) {
      x = Math.random()*canvas.width;
      y = Math.random()*canvas.height;
      dist = 3 + Math.random() * 5;

      backgroundObjects.push(new Game.Star(x, y, dist));
    }

    Game.Player.respawn();

    Game.InputHandler.addKeyInput('80', {
      keyup: function(e) {
        Game.paused = !Game.paused;

        if (Game.paused) {
          Game.showMessage('Paused');
          draw();
        } else {
          message = {};
        }
      }
    });

    Game.InputHandler.addKeyInput('78', {
      keydown: function(e) {
        if (Game.paused) {
          update();
          draw();
        }
      }
    });

    Game.paused = false;

    update();
    draw();

  };

  Game.start = function() {
    requestAnimationFrame(gameLoop);

    Game.playing = true;
    console.log('Game started.');

    Game.showMessage('Wormhole', 'Move with arrow keys, shoot with space.', 6);
  };

  Game.addPlayer = function(id) {
    var x = Math.random()*canvas.width
      , y = Math.random()*canvas.height;

    wormholes[id] = new Game.Wormhole(x, y, id);
    gameObjects.push(wormholes[id]);
  };

  Game.removePlayer = function(id) {
    wormholes[id].scaleTo(0, function() {
      gameObjects.splice(gameObjects.indexOf(wormholes[id]), 1);
      delete wormholes[id];
      console.log('Wormhole removed.');
    });
  };

  Game.addObject = function(obj) {
    gameObjects.push(obj);
  };

  Game.removeObject = function(obj) {
    gameObjects.splice(gameObjects.indexOf(obj), 1);
  };

  Game.sendObject = function(obj, playerId) {
    Sockman.send(obj, playerId);
  };

  Game.receiveObject = function(obj, wormholeId) {
    var item = new Game.Missile(JSON.parse(obj));

    item.from = wormholeId;
    item.x = wormholes[wormholeId].x;
    item.y = wormholes[wormholeId].y;

    gameObjects.push(item);
  };

  Game.showMessage = function(title, detail, secs) {
    if (detail === undefined) { detail = ''; }
    
    message = {title: title, detail: detail};

    if (secs > 0) {
      setTimeout(function() {
        message = {};
      }, 1000*secs);
    }
  };

  Game.lose = function() {
    console.log('You lose!');
    Game.showMessage('You lose!', '', 0);
  };

  function gameLoop(ts) {
    if (!Game.paused) {
      update();
      draw();
    }

    if (Game.playing) {
      requestAnimationFrame(gameLoop);
    }
  }

  function update() {
    if (Math.random() < 0.001) {
      console.log('New item!');
      Game.addObject(new Game.Item({
        angle: Math.random() * 2 * Math.PI,
        x: Game.width + 10,
        y: Game.height + 10
      }));
    }

    backgroundObjects.forEach(function(obj) {
      obj.update();
    });

    for (var id in wormholes) {
      wormholes[id].update(gameObjects);
    }

    gameObjects.forEach(function(obj) {
      obj.update(gameObjects);
    });

    Game.frame++;
  }

  function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    backgroundObjects.forEach(function(obj) {
      var img = obj.render()
        , x = obj.x || 0
        , y = obj.y || 0;

      x = ((x % canvas.width) + canvas.width) % canvas.width;
      y = ((y % canvas.height) + canvas.height) % canvas.height;

      ctx.drawImage(img, x, y);
    });

    gameObjects.forEach(function(obj) {
      var img = obj.render()
        , x = obj.x || 0
        , y = obj.y || 0
        , w = obj.width || 0
        , h = obj.height || 0
        , sx = obj.scale || 1
        , sy = obj.scale || 1
        , angle = obj.angle || 0;

      obj.x = ((x % canvas.width) + canvas.width) % canvas.width;
      obj.y = ((y % canvas.height) + canvas.height) % canvas.height;
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

    drawHUD();

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(Game.frame, 0, 10);
  }

  function drawHUD() {
    var i;

    ctx.fillStyle = 'red';
    ctx.fillRect(0, canvas.height - 20, (Game.Player.ship.health / 100) * canvas.width, 20);

    for (i = 0; i < Game.lives; i++) {
      ctx.save();
      ctx.translate(30*i, 0);
      ctx.rotate(-0.5*Math.PI);
      ctx.translate(-0.5*lifeImg.width, 0.5*lifeImg.height);
      ctx.scale(0.5, 0.5);
      ctx.drawImage(lifeImg, 0, 0);
      ctx.restore();
    }

    if (message.title !== undefined) {
      var centerX = 0.5*canvas.width
        , centerY = 0.5*canvas.height
        , boxHeight = 60;

      if (message.detail !== '') {
        boxHeight += 48;
      }

      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.fillRect(0, centerY - 34, canvas.width, boxHeight);

      ctx.fillStyle = 'white';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message.title, centerX, centerY, 600);

      ctx.font = '22px Arial';
      ctx.fillText(message.detail, centerX, centerY + 48);
    }
  }

  return Game;
})(Game || {});
