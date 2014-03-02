var Game = (function(Game) {

  var canvas, ctx
    , frame = 0
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , wormholes = {}
    , gameLoop
    , inputHandler
    , drawOutlines = true;

  Game.playing = false;

  Game.init = function(id) {
    var i, x, y, dist, ship;

    window.wormholes = wormholes;

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
      gameObjects.splice(gameObjects.indexOf(wormholes[id]), 1)
      delete wormholes[id];
      console.log('Wormhole removed.');
    });
  };

  Game.addObject = function(obj) {
    obj.update();
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
        , sx = obj.scale || 1
        , sy = obj.scale || 1
        , angle = obj.angle || 0;

      x = ((x % canvas.width) + canvas.width) % canvas.width;
      y = ((y % canvas.height) + canvas.height) % canvas.height;

      ctx.save();
      ctx.translate(x + 0.5*w, y + 0.5*h);
      ctx.rotate(obj.angle);
      ctx.translate(-0.5*w, -0.5*h);
      ctx.scale(sx, sy);
      ctx.drawImage(img, 0, 0);

      if (drawOutlines) {
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, w, h);
      }

      ctx.restore();
    });

    ctx.fillStyle = '#fff';
    ctx.fillText(frame, 0, 10);
  }

  return Game;
})(Game || {});
var Game = (function(Game) {
  var buf = document.createElement('canvas')
    , ctx = buf.getContext('2d');

  Game.GameObject = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
    scaleTarget: 1,
    scaleSpeed: 0.5,
    angle: 0,
    speed: 0,
    triggers: [],

    update: function() {
      this.updatePosition();
      this.updateScale();
      this.processTriggers();

      if (this.sprite) {
        this.sprite.update();
      }
    },

    updateScale: function() {
      this.scale += this.scaleSpeed*(this.scaleTarget - this.scale);
    },

    updatePosition: function() {
      this.x += this.speed*Math.cos(this.angle);
      this.y += this.speed*Math.sin(this.angle);
    },

    render: function() {
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#777';
      ctx.fillRect(0, 0, this.width, this.height);

      return buf;
    },

    scaleTo: function(target, next) {
      var that = this;
      this.scaleTarget = target;
      this.triggers.push({
        condition: function() {
          return that.scale === that.scaleTarget;
        },
        action: next,
        selfDestruct: true
      });
    },

    processTriggers: function() {
      this.triggers.forEach(function(trigger, i, triggerArr) {
        if (trigger.condition()) {
          trigger.action();
          if (trigger.selfDestruct) {
            triggerArr.splice(i, 1);
          }
        }
      });
    }
  };

  return Game;
})(Game || {});
var Game = (function(Game) {

  Game.InputHandler = function() {
    this.addKeyInput = function(keyCode, controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          if (e.keyCode === parseInt(keyCode)) {
            controls[e.type]();
          }
        });
      }
    };
  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var itemImg = new Image();
  itemImg.src = '/images/item_none.png';

  Game.Item = function(I) {
    I = I || {};

    var that = this
      , sprite = new Game.Sprite()
      , speed = I.speed || 1;

    sprite.addImage(itemImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.type = 'item';

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.update = function() {
      this.x += speed*Math.cos(this.angle);
      this.y += speed*Math.sin(this.angle);
      sprite.update();
    };

    this.render = function() {
      return sprite.render();
    };

  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var shipNormalImg = new Image()
    , shipFire1 = new Image()
    , shipFire2 = new Image()
    , shipFire3 = new Image();

  shipNormalImg.src = '/images/ship_normal.png';
  shipFire1.src = '/images/ship_fire1.png';
  shipFire2.src = '/images/ship_fire2.png';
  shipFire3.src = '/images/ship_fire3.png';

  Game.Ship = function(x, y) {
    var that = this
      , spriteThrusting = new Game.Sprite(5)
      , spriteNormal = new Game.Sprite()
      , controlStates
      , speed = 0
      , driftAngle = 0;

    spriteNormal.addImage(shipNormalImg);
    spriteThrusting.addImage(shipFire1);
    spriteThrusting.addImage(shipFire2);
    spriteThrusting.addImage(shipFire3);

    this.sprite = spriteNormal;

    this.x = x;
    this.y = y;

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.updatePosition = function() {
      var driftX, driftY, thrustX, thrustY, thrust
        , that = this;

      if (controlStates.thrust) {
        // let's math this shit
        thrust = 0.2;

        driftX = this.speed*Math.cos(driftAngle);
        driftY = this.speed*Math.sin(driftAngle);
        thrustX = thrust*Math.cos(this.angle);
        thrustY = thrust*Math.sin(this.angle);

        driftX += thrustX;
        driftY += thrustY;

        this.speed = Math.sqrt(Math.pow(driftX, 2) + Math.pow(driftY, 2));
        driftAngle = Math.acos(driftX / this.speed);
        if (Math.asin(driftY / this.speed) < 0) {
          driftAngle *= -1;
        }
      }

      if (controlStates.turnLeft) {
        this.angle -= 0.1;
      }

      if (controlStates.turnRight) {
        this.angle += 0.1;
      }

      this.x += this.speed*Math.cos(driftAngle);
      this.y += this.speed*Math.sin(driftAngle);

      this.speed *= 0.99;
    };

    this.render = function() {
      return this.sprite.render();
    };

    this.controls = {
      '38': {
        keydown: function() {
          if (!controlStates.thrust) {
            controlStates.thrust = true;
            that.sprite = spriteThrusting;
          }
        },
        keyup: function() {
          if (controlStates.thrust) {
            controlStates.thrust = false;
            that.sprite = spriteNormal;
          }
        }
      },

      '37': {
        keydown: function() {
          if (!controlStates.turnLeft) {
            controlStates.turnLeft = true;
          }
        },
        keyup: function() {
          if (controlStates.turnLeft) {
            controlStates.turnLeft = false;
          }
        }
      },

      '39': {
        keydown: function() {
          if (!controlStates.turnRight) {
            controlStates.turnRight = true;
          }
        },
        keyup: function() {
          if (controlStates.turnRight) {
            controlStates.turnRight = false;
          }
        }
      },

      '32': {
        keydown: function() {
          Game.addObject(new Game.Item({
            x: that.x + 0.5*that.height,
            y: that.y,// + 0.5*that.width,
            angle: that.angle,
            speed: that.speed + 1,
            scale: Math.random()
          }));
        }
      }
    };

    controlStates = {
      thrust: false,
      turnLeft: false,
      turnRight: false
    };
  };

  Game.Ship.prototype = Game.GameObject;

  return Game;
})(Game || {});
var Game = (function(Game) {
  Game.Sprite = function(frameRate) {
    var images = []
      , curFrame = 0
      , frameRate = frameRate || 1
      , subFrame = 0
      , buf = document.createElement('canvas')
      , ctx = buf.getContext('2d');

    this.width = 0;
    this.height = 0;

    this.update = function() {
      subFrame = (subFrame + 1) % frameRate;
      if (subFrame === 0) {
        curFrame = (curFrame + 1) % images.length;
      }

      this.width = buf.width;
      this.height = buf.height;
    };

    this.render = function() {
      var img = images[curFrame];

      if (img !== undefined) {
        buf.width = img.width;
        buf.height = img.height;

        ctx.clearRect(0, 0, buf.width, buf.height);
        ctx.drawImage(img, 0, 0);
      }

      return buf;
    };

    this.addImage = function(img) {
      var realImg;

      if (typeof img === 'string')
      {
        realImg = new Image();
        realImg.addEventListener('load', function() {
          images.push(realImg);
        });
        realImg.src = img;
      } else {
        images.push(img);
        if (images.length === 1) {
          this.width = img.width;
          this.height = img.height;
        }
      }
    };

  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var starImg = document.createElement('canvas')
    , ctx = starImg.getContext('2d');

  starImg.width = 2;
  starImg.height = 2;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, starImg.width, starImg.height);

  Game.Star = function(x, y, dist) {
    this.dist = dist;
    this.x = x;
    this.y = y;

    this.update = function() {
      this.x -= 1/this.dist;
      this.y -= 0.5/this.dist;
    };

    this.render = function() {
      return starImg;
    };
  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var img = new Image()
    , sprite = new Game.Sprite();

  img.addEventListener('load', function() {
    sprite.addImage(img);
  });
  img.src = '/images/wormhole.png';

  Game.Wormhole = function(x, y, id) {
    var that = this;

    this.angle = 0;
    this.x = x;
    this.y = y;
    this.width = img.width;
    this.height = img.height;

    this.update = function(gameObjects) {
      gameObjects.forEach(function(obj) {
        var dist;

        if (obj.type !== 'item' || obj.from === id) { return; }

        dist = Math.sqrt(Math.pow(that.x - obj.x, 2) + Math.pow(that.y - obj.y, 2));

        if (dist < 100) {
          Game.sendObject(JSON.stringify(obj), id);
          Game.removeObject(obj);
        }
      });

      this.angle -= 0.01;

      this.processTriggers();
    };

    this.render = function() {
      return sprite.render();
    };
  };

  Game.Wormhole.prototype = Game.GameObject;

  return Game;
})(Game || {});
