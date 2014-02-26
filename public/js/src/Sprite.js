var Game = (function(Game) {
  Game.Sprite = function(I) {
    I = I || {};

    var image
      , buf = document.createElement('canvas')
      , ctx = buf.getContext('2d');

    this.render = function() {
      ctx.clearRect(0, 0, buf.width, buf.height);
      ctx.drawImage(image, 0, 0);

      return buf;
    };

    this.addImage = function(img) {
      buf.width = img.width;
      buf.height = img.height;

      image = img;
    };

  };

  return Game;
})(Game || {});
