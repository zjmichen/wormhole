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
    this.type = 'explosion';

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

  };

  return Game;
})(Game || {});
