var Game = (function(Game) {
  var nukeImg = new Image()
    , itemImg = new Image();

  nukeImg.src = '/images/nuke.png';
  itemImg.src = '/images/item_nuke.png';

  Game.Nuke = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(nukeImg);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.from = I.from || undefined;
    this.ttl = 500;
    this.type = 'weapon';
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

    this.interactWith = function(obj) {
      if (this.from === undefined || obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < 40) {
        this.blowUp();
      } else if (this.distanceTo(obj) < 500) {
        this.turnToward(obj, 0.1);
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
        x = (this.x + dist*Math.cos(theta)) % Game.Canvas.width;
        y = (this.y + dist*Math.sin(theta)) % Game.Canvas.height;

        Game.addObject(new Game.Explosion({ x: x, y: y }));
      }

      Game.removeObject(this);
    };

  };

  Game.Arsenal.addType({
    name: 'nuke',
    img: itemImg,
    prob: 0.1,
    constructor: Game.Nuke
  });

  return Game;
})(Game || {});
