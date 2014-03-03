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
      if (obj.type !== 'item') { return; }

      if (that.distanceTo(obj) < 100) {
        this.pullToward(obj);

        if (obj.from !== id) {
          obj.from = id;
          obj.scaleSpeed = 0.03*obj.speed;
          obj.scaleTo(0, function() {
            Game.sendObject(JSON.stringify(obj), id);
            Game.removeObject(obj);
          });
        }
      }
    };

    this.pullToward = function(obj) {
      var wormholeAngle = Math.atan( (this.y - obj.y) /
                                     (this.x - obj.x) );
      if (this.x - obj.x < 0) {
        wormholeAngle += Math.PI;
      }

      obj.angle += 0.8*(wormholeAngle - obj.angle);
    };
  };

  Game.Wormhole.prototype = Game.GameObject;

  return Game;
})(Game || {});
