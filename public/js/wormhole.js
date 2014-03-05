var Game = (function(Game) {
  var img1 = new Image()
    , img2 = new Image();

  img1.src = '/images/explosion1.png';
  img2.src = '/images/explosion2.png';

  Game.Explosion = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(img1);
    this.sprite.addImage(img2);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = 0;
    this.scale = 1;
    this.speed = 0;
    this.ttl = I.ttl || 100;
    this.type = 'explosion';

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.updateExtra = function() {
      this.ttl--;
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        that.scaleTo(0, function() {
          Game.removeObject(that);
        });
      }
    });

  };

  return Game;
})(Game || {});
var Game = (function(Game) {

  var canvas, ctx
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

    ctx.fillStyle = '#fff';
    ctx.fillText(Game.frame, 0, 10);
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
    triggers: undefined,
    type: 'object',

    update: function(gameObjects) {
      var that = this;

      this.updatePosition();
      this.updateScale();
      this.updateExtra();
      this.processTriggers();

      gameObjects.forEach(function(obj) {
        that.interactWith(obj);
      });

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

    updateExtra: function() {
    },

    render: function() {
      if (this.sprite && typeof this.sprite.render === 'function') {
        return this.sprite.render();
      } else {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = '#777';
        ctx.fillRect(0, 0, this.width, this.height);

        return buf;
      }
    },

    scaleTo: function(target, next) {
      var that = this
        , threshhold = 0.0001;

      this.scaleTarget = target;
      if (typeof next === 'function') {
        this.addTrigger({
          condition: function() {
            return Math.abs(that.scale - that.scaleTarget) < threshhold;
          },
          action: next
        });
      }
    },

    processTriggers: function() {
      if (this.triggers === undefined) { return; }

      this.triggers.forEach(function(trigger, i, triggerArr) {
        if (trigger.condition()) {
          trigger.action();
          if (!trigger.repeat) {
            triggerArr.splice(i, 1);
          }
        }
      });
    },

    addTrigger: function(trigger) {
      if (this.triggers === undefined) {
        this.triggers = [];
      }

      this.triggers.push(trigger);
    },

    interactWith: function(obj) {
    },

    distanceTo: function(obj) {
      return Math.sqrt(Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2));
    },

    turnToward: function(obj, amount) {
      var objAngle = Math.atan( (obj.y - this.y) /
                                (obj.x - this.x) );
      if (obj.x - this.x < 0) {
        objAngle += Math.PI;
      }

      this.angle += amount*(objAngle - this.angle);
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
      , sprite = new Game.Sprite();

    sprite.addImage(itemImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.type = 'item';

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.render = function() {
      return sprite.render();
    };

  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var missileImg1 = new Image()
    , missileImg2 = new Image();

  missileImg1.src = '/images/missile1.png';
  missileImg2.src = '/images/missile2.png';

  Game.Missile = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(missileImg1);
    this.sprite.addImage(missileImg2);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.ttl = 200;
    this.type = 'weapon';

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.updateExtra = function() {
      if (this.ttl > 0) {
        this.ttl--;
      }
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        Game.addObject(new Game.Explosion({
          x: that.x,
          y: that.y
        }));

        Game.removeObject(that);
      }
    });

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
          var itemBoost = 3
            , itemSpeedX = that.speed*Math.cos(driftAngle) + itemBoost*Math.cos(that.angle)
            , itemSpeedY = that.speed*Math.sin(driftAngle) + itemBoost*Math.sin(that.angle)
            , itemSpeed = Math.sqrt(Math.pow(itemSpeedX, 2) + Math.pow(itemSpeedY, 2));

          Game.addObject(new Game.Missile({
            x: that.x + 0.5*that.height,
            y: that.y,
            angle: that.angle,
            speed: itemSpeed
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
  ctx.fillStyle = 'black';
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
  img.src = '/images/wormhole_inverted.png';

  Game.Wormhole = function(x, y, id) {
    var that = this;

    this.angle = 0;
    this.x = x;
    this.y = y;
    this.width = img.width;
    this.height = img.height;

    this.updatePosition = function() {
      this.angle -= 0.01;
    };

    this.render = function() {
      return sprite.render();
    };

    this.interactWith = function(obj) {
      if (obj.type !== 'weapon') { return; }

      if (that.distanceTo(obj) < 100) {
        obj.turnToward(this, 0.8);

        if (obj.from !== id) {
          obj.from = id;
          obj.scaleSpeed = 0.03*obj.speed;
          obj.scaleTo(0, function() {
            Game.sendObject(JSON.stringify(obj), id);
            Game.removeObject(obj);
          });
        }
      }
    };

    this.pullToward = function(obj) {
      var wormholeAngle = Math.atan( (this.y - obj.y) /
                                     (this.x - obj.x) );
      if (this.x - obj.x < 0) {
        wormholeAngle += Math.PI;
      }

      obj.angle += 0.8*(wormholeAngle - obj.angle);
    };
  };

  return Game;
})(Game || {});
