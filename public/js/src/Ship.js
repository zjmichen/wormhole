var Game = (function(Game) {

  Game.Ship = function(x, y) {
    var sprite
      , spriteThrusting = new Game.Sprite(5)
      , spriteNormal = new Game.Sprite();

    spriteThrusting.addImage('/images/ship_fire1.png');
    spriteThrusting.addImage('/images/ship_fire2.png');
    spriteThrusting.addImage('/images/ship_fire3.png');

    spriteNormal.addImage('/images/ship_normal.png');

    sprite = spriteNormal;

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
