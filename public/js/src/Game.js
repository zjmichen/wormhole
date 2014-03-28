var Game = (function(Game) {

  var that = this
    , canvas, ctx
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , wormholes = {}
    , gameLoop
    , canvas
    , message = {};

  Game.playing = false;
  Game.frame = 0;
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
    Game.Mine.prototype = Game.GameObject;

    canvas = document.getElementById(id);
    Game.Canvas.init(canvas);

    for (i = 0; i < 0.0005*canvas.width*canvas.height; i++) {
      x = Math.random()*canvas.width;
      y = Math.random()*canvas.height;
      dist = 3 + Math.random() * 5;

      backgroundObjects.push(new Game.Star(x, y, dist));
    }

    Game.Player.respawn();
    Game.Player.lives = 3;

    Game.InputHandler.addKeyInput('80', {
      keyup: function(e) {
        Game.paused = !Game.paused;

        if (Game.paused) {
          Game.Canvas.showMessage('Paused');
          draw();
        } else {
          Game.Canvas.clearMessage();
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

    Game.Canvas.showMessage('Wormhole', 'Move with arrow keys, shoot with space.', 6);
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
    var obj = JSON.parse(obj)
      , Weapon = Game.Arsenal.getConstructor(obj.weaponType);

    obj.from = wormholeId;
    obj.x = wormholes[wormholeId].x;
    obj.y = wormholes[wormholeId].y;

    gameObjects.push(new Weapon(obj));
  };

  Game.lose = function() {
    console.log('You lose!');
    Game.Canvas.showMessage('You lose!', 0);
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
    if (Math.random() < 0.001 || Game.frame < 4) {
      Game.addObject(new Game.Item({
        itemType: Game.Arsenal.getRandomType(),
        angle: Math.random() * 2 * Math.PI,
        x: Game.Canvas.width + 10,
        y: Game.Canvas.height + 10,
        ttl: 800
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
    Game.Canvas.clear();
    Game.Canvas.drawSimple(backgroundObjects);
    Game.Canvas.drawComplex(gameObjects);
    Game.Canvas.drawHUD(Game.Player);
    Game.Canvas.drawFrameCount(Game.frame);

  }

  return Game;
})(Game || {});
