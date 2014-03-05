var Game = (function(Game) {
  var missileImg1 = new Image()
    , missileImg2 = new Image();

  missileImg1.src = '/images/missile1.png';
  missileImg2.src = '/images/missile2.png';

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
    this.ttl = 200;
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

    this.addTrigger({
      condition: function() {
        return that.ttl <= 0;
      },
      action: function() {
        Game.addObject(new Game.Explosion({
          x: that.x,
          y: that.y
        }));

        Game.removeObject(that);
      }
    });

    this.interactWith = function(obj) {
      if (this.from === undefined || obj.type !== 'ship') { return; }

      this.turnToward(obj, 0.4);
    };

  };

  return Game;
})(Game || {});
