var Game = (function(Game) {
  var mineImg1 = new Image()
    , mineImg2 = new Image()
    , mineImg3 = new Image()
    , itemImg = new Image();

  mineImg1.src = '/images/mine1.png';
  mineImg2.src = '/images/mine2.png';
  mineImg3.src = '/images/mine3.png';
  itemImg.src = '/images/item_mine.png';

  Game.Mine = function(I) {
    I = I || {};

    var that = this;
    this.sprite = new Game.Sprite(5);
    this.sprite.addImage(mineImg1);

    this.x = I.x || 0;
    this.y = I.y || 0;
    this.angle = I.angle || 0;
    this.scale = I.scale || 1;
    this.speed = I.speed || 1;
    this.from = I.from || undefined;
    this.damage = I.damage || 20;
    this.type = 'weapon';
    this.weaponType = 'mine';

    if (this.from === undefined) {
      this.sprite.addImage(mineImg3);
    } else {
      this.sprite.addImage(mineImg2);
    }

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.interactWith = function(obj) {
      if (this.from === undefined) { return; }
      if (obj.type === 'weapon' && obj.from !== this.from) {
        this.blowUp();
      }

      if (obj.type !== 'ship') { return; }

      if (this.distanceTo(obj) < 40) {
        Game.Player.health -= this.damage;
        this.blowUp();
      }
    };

  };

  Game.Arsenal.addType({
    name: 'mine',
    img: itemImg,
    prob: 0.4,
    constructor: Game.Mine
  });

  return Game;
})(Game || {});
