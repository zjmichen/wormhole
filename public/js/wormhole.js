var Game = (function(Game) {
  var types = {
    'none': {
      prob: 0,
      img: new Image(),
      constructor: Game.Explosion
    }
  };

  Game.Arsenal = {

    getRandomType: function() {
      var r = Math.random()
        , probSum = 0
        , threshhold = 0;

      for (var weapon in types) {
        if (r < probSum + types[weapon].prob) {
          return weapon;
        }

        probSum += types[weapon].prob;
      };
    },

    getImage: function(type) {
      if (types[type] === undefined) {
        return null;
      }

      return types[type].img;
    },

    getConstructor: function(type) {
      return types[type].constructor;
    },

    addType: function(typeObj) {
      if (typeof typeObj.img === "string") {
        var imgUrl = typeObj.img;
        typeObj.img = new Image();
        typeObj.img.src = imgUrl;
      }

      typeObj.img = typeObj.img || new Image();
      typeObj.prob = typeObj.prob || 0;
      types[typeObj.name] = typeObj;
    }

  };

  return Game;
})(Game || {});
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
        try {
          ctx.drawImage(img, 0, 0);
        } catch (e) {
          Game.removeObject(obj);
          console.log(e);
        }

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

    this.interactWith = function(obj) {
      if (obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < 100 && obj.health > 0) {
        obj.health -= 0.1;
      }
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

    Game.Canvas.showMessage('Wormhole', 'Move with arrow keys. Pick up floating objects and shoot them into your opponents\' wormholes with space.', 6);
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
      var dy = obj.y - this.y
        , dx = obj.x - this.x
        , objAngle = Math.atan( (obj.y - this.y) /
                                (obj.x - this.x) );

      if (dx < 0) {
        objAngle += Math.PI;
      } else if (dy < 0) {
        objAngle += 2*Math.PI;
      }

      if (Math.abs(dy) < objAngle - this.angle) {
        amount = 1;
      }

      this.angle += amount*(objAngle - this.angle);
    },

    blowUp: function() {
      var that = this;

      Game.addObject(new Game.Explosion({
        x: that.x,
        y: that.y
      }));

      Game.removeObject(this);
    },

  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var codes = {
    'space': 32,
    'left': 37,
    'up': 38,
    'right': 39
  };

  Game.InputHandler = {
    addKeyInput: function(keyCode, controls) {
      if (isNaN(parseInt(keyCode))) {
        keyCode = codes[keyCode];
      }

      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          if (e.keyCode === parseInt(keyCode)) {
            controls[e.type]();
          }
        });
      }
    },

    addInput: function(controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          controls[e.type](e);
        });
      }
    }
  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  Game.Item = function(I) {
    I = I || {};

    var that = this
      , sprite = new Game.Sprite();


    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.itemType = I.itemType || 'none';
    this.type = 'item';
    this.ttl = I.ttl || 1000;

    sprite.addImage(Game.Arsenal.getImage(this.itemType));

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.updateExtra = function() {
      this.ttl--;
    };

    this.render = function() {
      return sprite.render();
    };

    this.interactWith = function(obj) {
      if (obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < obj.reach) {
        obj.pickUp(this);
      }
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        Game.removeObject(that);
      }
    });

  };

  return Game;
})(Game || {});
var Game = (function(Game) {
  var mineImg1 = new Image()
    , mineImg2 = new Image()
    , mineImg3 = new Image()
    , itemImg = new Image();

  mineImg1.src = '/images/mine1.png';
  mineImg2.src = '/images/mine2.png';
  mineImg3.src = '/images/mine3.png';
  itemImg.src = '/images/item_mine.png';

  Game.Mine = function(I) {
    I = I || {};

    var that = this;
    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(mineImg1);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.from = I.from || undefined;
    this.damage = I.damage || 20;
    this.type = 'weapon';
    this.weaponType = 'mine';

    if (this.from === undefined) {
      this.sprite.addImage(mineImg3);
    } else {
      this.sprite.addImage(mineImg2);
    }

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.interactWith = function(obj) {
      if (this.from === undefined) { return; }
      if (obj.type === 'weapon' && obj.from !== this.from) {
        this.blowUp();
      }

      if (obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < 40) {
        Game.Player.health -= this.damage;
        this.blowUp();
      }
    };

  };

  Game.Arsenal.addType({
    name: 'mine',
    img: itemImg,
    prob: 0.4,
    constructor: Game.Mine
  });

  return Game;
})(Game || {});
var Game = (function(Game) {
  var missileImg1 = new Image()
    , missileImg2 = new Image()
    , itemImg = new Image();

  missileImg1.src = '/images/missile1.png';
  missileImg2.src = '/images/missile2.png';
  itemImg.src = '/images/item_missile.png';

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
    this.from = I.from || undefined;
    this.damage = I.damage || 10;
    this.ttl = 500;
    this.type = 'weapon';
    this.weaponType = 'missile';

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

    this.interactWith = function(obj) {
      if (this.from === undefined || obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < 40) {
        Game.Player.health -= this.damage;
        this.blowUp();
      } else if (this.distanceTo(obj) < 500) {
        this.turnToward(obj, 0.1);
      }
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        that.blowUp();
      }
    });

  };

  Game.Arsenal.addType({
    name: 'missile',
    img: itemImg,
    prob: 0.4,
    constructor: Game.Missile
  });

  return Game;
})(Game || {});
var Game = (function(Game) {
  var nukeImg = new Image()
    , itemImg = new Image();

  nukeImg.src = '/images/nuke.png';
  itemImg.src = '/images/item_nuke.png';

  Game.Nuke = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(nukeImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.from = I.from || undefined;
    this.ttl = 500;
    this.type = 'weapon';
    this.weaponType = 'nuke';
    this.payload = 100;

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
        that.blowUp();
      }
    });

    this.blowUp = function() {
      var i, x, y, dist, theta;

      for (i = 0; i < this.payload; i++) {
        theta = Math.random() * 2 * Math.PI;
        dist = Math.random() * 250;
        x = (this.x + dist*Math.cos(theta)) % Game.Canvas.width;
        y = (this.y + dist*Math.sin(theta)) % Game.Canvas.height;

        Game.addObject(new Game.Explosion({ x: x, y: y }));
      }

      Game.removeObject(this);
    };

  };

  Game.Arsenal.addType({
    name: 'nuke',
    img: itemImg,
    prob: 0.1,
    constructor: Game.Nuke
  });

  return Game;
})(Game || {});
var Game = (function(Game) {
  Game.Player = {
    lives: 3,
    items: [],
    health: 100,
    ship: undefined,

    respawn: function() {
      if (this.lives <= 0) {
        Game.lose();
        return;
      }

      this.ship = new Game.Ship(0.5*Game.Canvas.width, 0.5*Game.Canvas.height);

      this.lives--;
      this.health = 100;
      this.items = [];

      Game.addObject(this.ship);
    }
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
    this.type = 'ship';
    this.reach = 50;

    Object.defineProperty(this, 'health', {
      get: function() { return Game.Player.health; },
      set: function(h) { Game.Player.health = h; }
    });

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

    this.pickUp = function(item) {
      if (item.type !== 'item') { return; }

      Game.Player.items.push(new Game.Item(item));
      Game.removeObject(item);
    };

    Game.InputHandler.addKeyInput('up', {
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
    });

    Game.InputHandler.addKeyInput('left', {
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
    });

    Game.InputHandler.addKeyInput('right', {
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
    });

    Game.InputHandler.addKeyInput('space', {
      keydown: function() {
        if (Game.Player.items.length <= 0) { return; }

        var itemBoost = 3
          , itemSpeedX = that.speed*Math.cos(driftAngle) + itemBoost*Math.cos(that.angle)
          , itemSpeedY = that.speed*Math.sin(driftAngle) + itemBoost*Math.sin(that.angle)
          , itemSpeed = Math.sqrt(Math.pow(itemSpeedX, 2) + Math.pow(itemSpeedY, 2))
          , item, weapon;

        item = Game.Player.items.pop();
        Weapon = Game.Arsenal.getConstructor(item.itemType);

        Game.addObject(new Weapon({
          x: that.x + 0.5*that.height,
          y: that.y,
          angle: that.angle,
          speed: itemSpeed
        }));
      }
    });

    controlStates = {
      thrust: false,
      turnLeft: false,
      turnRight: false
    };

    this.addTrigger({
      condition: function() {
        return that.health <= 0;
      },
      action: function() {
        Game.Player.lives--;
        that.blowUp();
        setTimeout(function() {
          Game.Player.respawn();
        }, 2000);
      }
    })
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
        try {
          ctx.drawImage(img, 0, 0);
        } catch (e) {
          console.log(e);
          ctx.fillStye = 'red';
          ctx.fillRect(0, 0, buf.width, buf.height);
          console.log(buf);
        }
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

    this.updatePosition = function() {
      this.angle -= 0.01;
    };

    this.render = function() {
      return sprite.render();
    };

    this.interactWith = function(obj) {
      if (obj.type !== 'weapon' || obj.from === id) { return; }

      if (that.distanceTo(obj) < 100) {
        obj.turnToward(this, 0.8);

        if (obj.to !== id) {
          obj.to = id;
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
