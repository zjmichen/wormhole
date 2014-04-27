var W = (function(W) {
  var img1 = new Image()
    , img2 = new Image();

  img1.src = '/images/explosion1.png';
  img2.src = '/images/explosion2.png';

  W.Explosion = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new W.Sprite(5);
    this.sprite.addImage(img1);
    this.sprite.addImage(img2);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = 0;
    this.scale = 1;
    this.speed = 0;
    this.ttl = I.ttl || 100;
    this.type = 'explosion';

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.updateExtra = function() {
      this.ttl--;
    };

    this.interactWith = function(obj) {
      if (obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < 100 && obj.health > 0) {
        obj.health -= 0.1;
      }
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        that.scaleTo(0, function() {
          W.removeObject(that);
        });
      }
    });

  };

  return W;
})(W || {});
