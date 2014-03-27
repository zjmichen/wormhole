var Game = (function(Game) {
  var itemImg = new Image();
  itemImg.src = '/images/item_none.png';

  Game.Item = function(I) {
    I = I || {};

    var that = this
      , sprite = new Game.Sprite();

    sprite.addImage(itemImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.type = 'item';
    this.ttl = I.ttl || 1000;

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.updateExtra = function() {
      this.ttl--;
    };

    this.render = function() {
      return sprite.render();
    };

    this.interactWith = function(obj) {
      if (obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < obj.reach) {
        obj.pickUp(this);
      }
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        Game.removeObject(that);
      }
    });

  };

  return Game;
})(Game || {});
