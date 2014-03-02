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
      if (obj.type !== 'item' || obj.from === id) { return; }

      if (that.distanceTo(obj) < 100) {
        obj.from = id;
        obj.scaleTo(0, function() {
          Game.sendObject(JSON.stringify(obj), id);
          Game.removeObject(obj);
        });
      }
    };
  };

  Game.Wormhole.prototype = Game.GameObject;

  return Game;
})(Game || {});
