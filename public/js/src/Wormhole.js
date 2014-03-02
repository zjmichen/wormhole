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

    this.update = function(gameObjects) {
      gameObjects.forEach(function(obj) {
        var dist;

        if (obj.type !== 'item' || obj.from === id) { return; }

        dist = Math.sqrt(Math.pow(that.x - obj.x, 2) + Math.pow(that.y - obj.y, 2));

        if (dist < 100) {
          Game.sendObject(JSON.stringify(obj), id);
          Game.removeObject(obj);
        }
      });

      this.angle -= 0.01;

      this.processTriggers();
    };

    this.render = function() {
      return sprite.render();
    };
  };

  Game.Wormhole.prototype = Game.GameObject;

  return Game;
})(Game || {});
