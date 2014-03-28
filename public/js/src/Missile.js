var Game = (function(Game) {
  var missileImg1 = new Image()
    , missileImg2 = new Image()
    , itemImg = new Image();

  missileImg1.src = '/images/missile1.png';
  missileImg2.src = '/images/missile2.png';
  itemImg.src = '/images/item_missile.png';

  Game.Missile = function(I) {
    I = I || {};

    var that = this;

    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(missileImg1);
    this.sprite.addImage(missileImg2);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.from = I.from || undefined;
    this.ttl = 500;
    this.type = 'weapon';

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

  };

  Game.Arsenal.addType({
    name: 'missile',
    img: itemImg,
    prob: 0.9,
    constructor: Game.Missile
  });

  return Game;
})(Game || {});
