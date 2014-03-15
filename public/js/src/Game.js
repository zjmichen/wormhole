var Game = (function(Game) {

  var that = this
    , canvas, ctx
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , wormholes = {}
    , gameLoop
    , inputHandler;

  Game.playing = false;
  Game.frame = 0;
  Game.debug = {
    drawOutlines: false
  };

  Game.init = function(id) {
    var i, x, y, dist, ship;

    // set up prototype chain here to avoid parallel loading bug
    Game.Explosion.prototype = Game.GameObject;
    Game.Ship.prototype = Game.GameObject;
    Game.Missile.prototype = Game.GameObject;
    Game.Wormhole.prototype = Game.GameObject;
    Game.Item.prototype = Game.GameObject;

    inputHandler = new Game.InputHandler();

    canvas = document.getElementById(id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    window.onresize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    for (i = 0; i < 0.0005*canvas.width*canvas.height; i++) {
      x = Math.random()*canvas.width;
      y = Math.random()*canvas.height;
      dist = 3 + Math.random() * 5;

      backgroundObjects.push(new Game.Star(x, y, dist));
    }

    ship = new Game.Ship(0.5*canvas.width, 0.5*canvas.height);
    for (var key in ship.controls) {
      inputHandler.addKeyInput(key, ship.controls[key]);
    }

    gameObjects.push(ship);
    window.ship = ship;

    inputHandler.addKeyInput('80', {
      keyup: function(e) {
        Game.paused = !Game.paused;
      }
    });

    inputHandler.addKeyInput('78', {
      keydown: function(e) {
        if (Game.paused) {
          update();
          draw();
        }
      }
    });

    inputHandler.addMouseInput({
      click: function(e) {
        Game.addObject(new Game.Missile({
          x: e.clientX,
          y: e.clientY,
          from: 'other',
          speed: 3,
          angle: 0.5*Math.PI
        }));
      }
    });

    Game.paused = false;

    update();
    draw();

  };

  Game.start = function() {
    gameLoop = setInterval(function() {
      if (!Game.paused) {
        update();
        draw();
      }
    }, 1000/frameRate);

    Game.playing = true;
    console.log('Game started.');
  };

  Game.stop = function() {
    clearInterval(gameLoop);
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
    obj.update(gameObjects);
    obj.render();
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

  function update() {
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
    ctx.fillStyle = 'white';
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
    ctx.fillText(Game.frame, 0, 10);
  }

  function drawHUD() {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, (ship.health / 100) * canvas.width, 20);
  }

  return Game;
})(Game || {});
