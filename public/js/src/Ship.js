var Game = (function(Game) {

  Game.Ship = function(x, y) {
    var that = this
      , sprite
      , spriteThrusting = new Game.Sprite(5)
      , spriteNormal = new Game.Sprite()
      , controlStates
      , speed = 0;

    spriteThrusting.addImage('/images/ship_fire1.png');
    spriteThrusting.addImage('/images/ship_fire2.png');
    spriteThrusting.addImage('/images/ship_fire3.png');

    spriteNormal.addImage('/images/ship_normal.png');

    sprite = spriteNormal;

    this.x = x;
    this.y = y;
    this.angle = 0;

    Object.defineProperty(this, 'width', {
      get: function() { return sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return sprite.height; }
    });

    this.update = function() {
      if (controlStates.thrust) {
        speed += 0.02;
      }

      if (controlStates.turnLeft) {
        this.angle -= 0.05;
      }

      if (controlStates.turnRight) {
        this.angle += 0.05;
      }

      this.x += speed*Math.cos(this.angle);
      this.y += speed*Math.sin(this.angle);
      speed *= 0.99;
      sprite.update();
    };

    this.render = function() {
      return sprite.render();
    };

    this.controls = {
      '38': {
        keydown: function() {
          if (!controlStates.thrust) {
            controlStates.thrust = true;
            sprite = spriteThrusting;
          }
        },
        keyup: function() {
          if (controlStates.thrust) {
            controlStates.thrust = false;
            sprite = spriteNormal;
          }
        }
      },

      '37': {
        keydown: function() {
          if (!controlStates.turnLeft) {
            controlStates.turnLeft = true;
          }
        },
        keyup: function() {
          if (controlStates.turnLeft) {
            controlStates.turnLeft = false;
          }
        }
      },

      '39': {
        keydown: function() {
          if (!controlStates.turnRight) {
            controlStates.turnRight = true;
          }
        },
        keyup: function() {
          if (controlStates.turnRight) {
            controlStates.turnRight = false;
          }
        }
      }
    };

    controlStates = {
      thrust: false,
      turnLeft: false,
      turnRight: false
    };
  };

  return Game;
})(Game || {});
