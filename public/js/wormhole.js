var Game = (function(Game) {

  var canvas, ctx
    , frame = 0
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , wormholes = {}
    , gameLoop;

  Game.playing = false;

  Game.init = function(id) {
    var i, x, y, dist;

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

    gameObjects.push(new Game.Ship(0.5*canvas.width, 0.5*canvas.height));

  };

  Game.start = function() {
    gameLoop = setInterval(function() {
      update();
      draw();
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
    delete wormholes[id];
  };

  function update() {
    backgroundObjects.forEach(function(obj) {
      obj.update();
    });

    for (var id in wormholes) {
      wormholes[id].update();
    }

    gameObjects.forEach(function(obj) {
      obj.update();
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

    //for (var id in wormholes) {
    //  var img = wormholes[id].render()
    //    , x = wormholes[id].x || 0
    //    , y = wormholes[id].y || 0;

    //  ctx.drawImage(img, x, y);
    //  ctx.fillStyle = 'white';
    //  ctx.fillText(id, x, y);
    //}

    gameObjects.forEach(function(obj) {
      var img = obj.render()
        , x = obj.x || 0
        , y = obj.y || 0
        , w = obj.width || 0
        , h = obj.height || 0
        , angle = obj.angle || 0;

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
var Game = (function(Game) {

  Game.Ship = function(x, y) {
    var sprite = new Game.Sprite(5);

    sprite.addImage('/images/ship_fire1.png');
    sprite.addImage('/images/ship_fire2.png');
    sprite.addImage('/images/ship_fire3.png');

    this.x = x;
    this.y = y;
    this.angle = 0;

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.update = function() {
      this.angle += 0.01;
      sprite.update();
    };

    this.render = function() {
      return sprite.render();
    };

    this.controlStates = {
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

    Object.defineProperty(this, 'width', {
      get: function() { return buf.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return buf.height; }
    });

    this.update = function() {
      subFrame = (subFrame + 1) % frameRate;
      if (subFrame === 0) {
        curFrame = (curFrame + 1) % images.length;
      }
    };

    this.render = function() {
      var img = images[curFrame];

      buf.width = img.width;
      buf.height = img.height;

      ctx.clearRect(0, 0, buf.width, buf.height);
      if (images.length > 0) {
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

  Game.Wormhole = function(x, y) {
    this.angle = 0;
    this.x = x;
    this.y = y;
    this.width = img.width;
    this.height = img.height;

    this.update = function() {
      this.angle -= 0.01;
    };

    this.render = function() {
      return sprite.render();
    };
  };

  return Game;
})(Game || {});
