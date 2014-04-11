var Game = (function(Game) {

  Game.Game = function(id) {
    this.canvas = new Game.Canvas(id);
    this.player = new Game.Player();
    this.arsenal = new Game.Arsenal();
    this.input = new Game.InputHandler();

    this.playing = false;
    this.paused = false;
    this.frame = 0;
    this.debug = {
      drawOutlines: false,
      inverted: false
    };
    this.objects = {
      background: [],
      foreground: []
    }
  };

  Game.Game.prototype.init = function(id) {
    var x, y, i, dist;

    if (this.debug.inverted) {
      Game.Star.changeColor('black');
    }

    for (i = 0; i < 0.0005*this.canvas.width*this.canvas.height; i++) {
      x = Math.random()*this.canvas.width;
      y = Math.random()*this.canvas.height;
      dist = 3 + Math.random() * 5;

      this.objects.background.push(new Game.Star(x, y, dist));
    }

    this.input.addKeyInput('p', {
      keyup: this.pause
    });

    this.input.addKeyInput('n', {
      keydown: function(e) {
        if (this.paused) {
          this.update();
          this.draw();
        }
      }
    });
  };

  Game.Game.prototype.pause = function() {
    this.paused = !this.paused;

    if (this.paused) {
      this.canvas.showMessage('Paused');
      this.draw();
    } else {
      this.canvas.clearMessage();
    }

    return this.paused;
  };

  Game.Game.prototype.start = function() {
    requestAnimationFrame(gameLoop);
    this.playing = true;
    this.canvas.showMessage('Wormhole', 'Move with arrow keys. Pick up floating objects and shoot them into your opponents\' wormholes with space.', 6);
    console.log('Game started.');
  };

  Game.Game.prototype.lose = function() {
    console.log('You lose!');
    this.canvas.showMessage('You lose!', 0);
  };

  Game.Game.prototype.update = function() {
    if (Math.random() < 0.001 || this.frame < 4) {
      this.addObject(new Game.Item({
        itemType: this.arsenal.getRandomType(),
        angle: Math.random() * 2*Math.PI,
        x: 0,
        y: 0,
        ttl: 800
      }));
    }

    this.objects.background.forEach(function(obj) {
      obj.update();
    });

    for (var id in this.wormholes) {
      this.wormholes[id].update(this.objects.foreground);
    }

    this.objects.foreground.forEach(function(obj) {
      obj.update(this.objects.foreground);
    });

    this.frame++;
  };

  Game.Game.prototype.draw = function() {
    this.canvas.clear();
    this.canvas.drawSimple(this.objects.background);
    this.canvas.drawComplex(this.objects.foreground);
    this.canvas.drawHUD(this.player);
    this.canvas.drawFrameCount(this.frame);
  };

  Game.Game.prototype.gameLoop = function() {
    if (!this.paused) {
      this.update();
      this.draw();
    }

    if (this.playing) {
      requestAnimationFrame(this.gameLoop);
    }
  };

  Game.Game.prototype.addPlayer = function(id) {
    var x = Math.random()*this.canvas.width
      , y = Math.random()*this.canvas.height;

    this.wormholes[id] = new Game.Wormhole(x, y, id);
    this.objects.foreground.push(this.wormholes[id]);
  };

  Game.Game.prototype.removePlayer = function(id) {
    this.wormholes[id].scaleTo(0, function() {
      this.objects.foreground.splice(this.objects.foreground.indexOf(this.wormholes[id]), 1);
      delete this.wormholes[id];
    });
  };

  Game.Game.prototype.addObject = function(obj) {
    this.objects.foreground.push(obj);
  };

  Game.Game.prototype.removeObject = function(obj) {
    this.objects.foreground.splice(this.objects.foreground.indexOf(obj), 1);
  };

  Game.Game.prototype.sendObject = function(obj, playerId) {
    Sockman.send(obj, playerId);
  };

  Game.Game.prototype.receiveObject = function(obj, wormholeId) {
    obj = JSON.parse(obj);
    var Weapon = this.arsenal.getConstructor(obj.weaponType);

    obj.from = wormholeId;
    obj.x = this.wormholes[wormholeId].x;
    obj.y = this.wormholes[wormholeId].y;

    this.objects.push(new Weapon(obj));
  };

  return Game;
})(Game || {});

/*
    // set up prototype chain here to avoid parallel loading bug
    Game.Explosion.prototype = Game.GameObject;
    Game.Ship.prototype = Game.GameObject;
    Game.Missile.prototype = Game.GameObject;
    Game.Nuke.prototype = Game.GameObject;
    Game.Wormhole.prototype = Game.GameObject;
    Game.Item.prototype = Game.GameObject;
    Game.Mine.prototype = Game.GameObject;
    */
