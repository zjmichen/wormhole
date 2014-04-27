var W = (function(W) {
  W.Item = function(I) {
    I = I || {};

    var that = this
      , sprite = new W.Sprite();


    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.itemType = I.itemType || 'none';
    this.type = 'item';
    this.ttl = I.ttl || 1000;

    sprite.addImage(W.Arsenal.getImage(this.itemType));

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
        W.removeObject(that);
      }
    });

  };

  return W;
})(W || {});
