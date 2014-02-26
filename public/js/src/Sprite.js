var Game = (function(Game) {
  Game.Sprite = function(frameRate) {
    var images = []
      , curFrame = 0
      , frameRate = frameRate || 1
      , subFrame = 0
      , buf = document.createElement('canvas')
      , ctx = buf.getContext('2d');

    Object.defineProperty(this, 'width', {
      get: function() { return buf.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return buf.height; }
    });

    this.update = function() {
      subFrame = (subFrame + 1) % frameRate;
      if (subFrame === 0) {
        curFrame = (curFrame + 1) % images.length;
      }
    };

    this.render = function() {
      var img = images[curFrame];

      buf.width = img.width;
      buf.height = img.height;

      ctx.clearRect(0, 0, buf.width, buf.height);
      if (images.length > 0) {
        ctx.drawImage(img, 0, 0);
      }

      return buf;
    };

    this.addImage = function(img) {
      var realImg;

      if (typeof img === 'string')
      {
        realImg = new Image();
        realImg.addEventListener('load', function() {
          images.push(realImg);
        });
        realImg.src = img;
      } else {
        images.push(img);
      }
    };

  };

  return Game;
})(Game || {});
