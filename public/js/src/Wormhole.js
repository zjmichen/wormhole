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
