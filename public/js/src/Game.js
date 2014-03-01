var Game = (function(Game) {

  var canvas, ctx
    , frame = 0
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , wormholes = {}
    , gameLoop
    , inputHandler;

  Game.playing = false;

  Game.init = function(id) {
    var i, x, y, dist, ship;

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

    inputHandler.addKeyInput('80', {
      keyup: function(e) {
        Game.paused = !Game.paused;
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
    gameObjects.splice(gameObjects.indexOf(wormholes[id]), 1)
    delete wormholes[id];
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
    var item = new Game.Item(JSON.parse(obj));

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

    frame++;
  }

  function draw() {
    ctx.fillStyle = '#000';
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
        , angle = obj.angle || 0;

      x = ((x % canvas.width) + canvas.width) % canvas.width;
      y = ((y % canvas.height) + canvas.height) % canvas.height;

      ctx.save();
      ctx.translate(x + 0.5*w, y + 0.5*h);
      ctx.rotate(obj.angle);
      ctx.translate(-0.5*w, -0.5*h);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#fff';
    ctx.fillText(frame, 0, 10);
  }

  return Game;
})(Game || {});
