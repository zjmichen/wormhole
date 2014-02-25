var Game = (function(Game) {
  Game.Ship = function(x, y) {
    var buffer, ctx;

    this.dist = dist;
    this.x = x;
    this.y = y;
    buffer = document.createElement('canvas');
    buffer.width = 100;
    buffer.height = 100;

    ctx = buffer.getContext('2d');
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, 100, 100);

    this.update = function() {
      this.x -= 1/this.dist;
      this.y -= 0.5/this.dist;
    };

    this.render = function() {
      return buffer;
    };

    this.controlStates = {
      thrust: false,
      turnLeft: false,
      turnRight: false
    };
  };

  return Game;
})(Game || {});
