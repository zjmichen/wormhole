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
  };

  Game.removePlayer = function(id) {
    delete wormholes[id];
  };

  function update() {
    backgroundObjects.forEach(function(obj) {
      obj.update();
    });

    for (id in wormholes) {
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

    for (id in wormholes) {
      var img = wormholes[id].render()
        , x = wormholes[id].x || 0
        , y = wormholes[id].y || 0;

      ctx.drawImage(img, x, y);
      ctx.fillStyle = 'white';
      ctx.fillText(id, x, y);
    }

    gameObjects.forEach(function(obj) {
      var img = obj.render()
        , x = obj.x || 0
        , y = obj.y || 0;

      ctx.drawImage(img, x, y);
    });

    ctx.fillStyle = '#fff';
    ctx.fillText(frame, 0, 10);
  }

  return Game;
})(Game || {});
var Game = (function(Game) {
  Game.Sprite = function(I) {
    I = I || {};

    var image
      , buf = document.createElement('canvas')
      , ctx = buf.getContext('2d');

    this.render = function(options) {
      options = options || {};
      options.angle = options.angle || 0;

      ctx.save();
      ctx.clearRect(0, 0, buf.width, buf.height);
      ctx.translate(0.5*buf.width, 0.5*buf.height);
      ctx.rotate(options.angle);
      ctx.translate(-0.5*buf.width, -0.5*buf.height);
      ctx.drawImage(image, 0, 0);
      ctx.restore();

      return buf;
    };

    this.addImage = function(img) {
      buf.width = img.width;
      buf.height = img.height;

      image = img;
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

    this.update = function() {
      this.angle -= 0.01;
    };

    this.render = function() {
      return sprite.render({angle: this.angle});
    };
  };

  return Game;
})(Game || {});
