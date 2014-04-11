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
  };

  Game.Star.changeColor = function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, starImg.width, starImg.height);
  };

  Game.Star.prototype.update = function() {
    this.x -= 1/this.dist;
    this.y -= 0.5/this.dist;
  };

  Game.Star.prototype.render = function() {
    return starImg;
  };

  return Game;
})(Game || {});
