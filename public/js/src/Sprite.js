var Game = (function(Game) {
  Game.Sprite = function(frameRate) {
    var images = []
      , curFrame = 0
      , frameRate = frameRate || 1
      , subFrame = 0
      , buf = document.createElement('canvas')
      , ctx = buf.getContext('2d');

    this.width = 0;
    this.height = 0;

    this.update = function() {
      subFrame = (subFrame + 1) % frameRate;
      if (subFrame === 0) {
        curFrame = (curFrame + 1) % images.length;
      }

      this.width = buf.width;
      this.height = buf.height;
    };

    this.render = function() {
      var img = images[curFrame];

      if (img !== undefined) {
        buf.width = img.width;
        buf.height = img.height;

        ctx.clearRect(0, 0, buf.width, buf.height);
        try {
          ctx.drawImage(img, 0, 0);
        } catch (e) {
          console.log(e);
          ctx.fillStye = 'red';
          ctx.fillRect(0, 0, buf.width, buf.height);
          console.log(buf);
        }
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
        if (images.length === 1) {
          this.width = img.width;
          this.height = img.height;
        }
      }
    };

  };

  return Game;
})(Game || {});
