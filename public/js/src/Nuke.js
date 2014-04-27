var W = (function(W) {
  var nukeImg = new Image()
    , itemImg = new Image();

  nukeImg.src = '/images/nuke.png';
  itemImg.src = '/images/item_nuke.png';

  W.Nuke = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new W.Sprite(5);
    this.sprite.addImage(nukeImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.from = I.from || undefined;
    this.ttl = 500;
    this.type = 'weapon';
    this.weaponType = 'nuke';
    this.payload = 100;

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.updateExtra = function() {
      if (this.ttl > 0) {
        this.ttl--;
      }
    };

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        that.blowUp();
      }
    });

    this.blowUp = function() {
      var i, x, y, dist, theta;

      for (i = 0; i < this.payload; i++) {
        theta = Math.random() * 2 * Math.PI;
        dist = Math.random() * 250;
        x = (this.x + dist*Math.cos(theta)) % W.Canvas.width;
        y = (this.y + dist*Math.sin(theta)) % W.Canvas.height;

        W.addObject(new W.Explosion({ x: x, y: y }));
      }

      W.removeObject(this);
    };

  };

  W.Arsenal.addType({
    name: 'nuke',
    img: itemImg,
    prob: 0.1,
    constructor: W.Nuke
  });

  return W;
})(W || {});
