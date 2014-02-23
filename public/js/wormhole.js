var Game = (function(Game) {

  var canvas, ctx
    , frame = 0
    , frameRate = 60
    , gameObjects = []
    , backgroundObjects = []
    , gameLoop;

  Game.init = function(id) {
    canvas = document.getElementById(id);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    window.onresize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

  };

  Game.start = function() {
    gameLoop = setInterval(function() {
      update();
      draw();
    }, 1000/frameRate);
    console.log('Game started.');
  };

  Game.stop = function() {
    clearInterval(gameLoop);
  };

  function update() {
    gameObjects.forEach(function(obj) {
      obj.update();
    });

    frame++;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
})({});
