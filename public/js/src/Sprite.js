var Game = (function(Game) {
  Game.Sprite = function(I) {
    I = I || {};

    var image
      , buf = document.createElement('canvas')
      , ctx = buf.getContext('2d');

    this.render = function() {
      //ctx.save();
      //ctx.translate(0.5*buf.width, 0.5*buf.height);
      //ctx.rotate(options.angle);
      //ctx.translate(-0.5*buf.width, -0.5*buf.height);
      ctx.clearRect(0, 0, buf.width, buf.height);
      ctx.drawImage(image, 0, 0);
      //ctx.restore();

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
