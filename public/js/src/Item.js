var Game = (function(Game) {
  var itemImg = new Image();
  itemImg.src = '/images/item_none.png';

  Game.Item = function(I) {
    I = I || {};

    var that = this
      , sprite = new Game.Sprite()
      , speed = I.speed || 1;

    sprite.addImage(itemImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.type = 'item';

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.update = function() {
      this.x += speed*Math.cos(this.angle);
      this.y += speed*Math.sin(this.angle);
      sprite.update();
    };

    this.render = function() {
      return sprite.render();
    };

  };

  return Game;
})(Game || {});