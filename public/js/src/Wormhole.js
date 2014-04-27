var W = (function(W) {
  var img = new Image()
    , sprite = new W.Sprite();

  img.addEventListener('load', function() {
    sprite.addImage(img);
  });
  img.src = (W.debug.inverted) ?
    '/images/wormhole_inverted.png' :
    '/images/wormhole.png';

  W.Wormhole = function(x, y, id) {
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
      if (obj.type !== 'weapon' || obj.from === id) { return; }

      if (that.distanceTo(obj) < 100) {
        obj.turnToward(this, 0.8);

        if (obj.to !== id) {
          obj.to = id;
          obj.scaleSpeed = 0.03*obj.speed;
          obj.scaleTo(0, function() {
            W.sendObject(JSON.stringify(obj), id);
            W.removeObject(obj);
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

  return W;
})(W || {});
