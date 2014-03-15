var Game = (function(Game) {
  var shipNormalImg = new Image()
    , shipFire1 = new Image()
    , shipFire2 = new Image()
    , shipFire3 = new Image();

  shipNormalImg.src = '/images/ship_normal.png';
  shipFire1.src = '/images/ship_fire1.png';
  shipFire2.src = '/images/ship_fire2.png';
  shipFire3.src = '/images/ship_fire3.png';

  Game.Ship = function(x, y) {
    var that = this
      , spriteThrusting = new Game.Sprite(5)
      , spriteNormal = new Game.Sprite()
      , controlStates
      , speed = 0
      , driftAngle = 0;

    spriteNormal.addImage(shipNormalImg);
    spriteThrusting.addImage(shipFire1);
    spriteThrusting.addImage(shipFire2);
    spriteThrusting.addImage(shipFire3);

    this.sprite = spriteNormal;

    this.x = x;
    this.y = y;
    this.type = 'ship';
    this.health = 100;

    Object.defineProperty(this, 'width', {
      get: function() { return this.sprite.width; }
    });
    Object.defineProperty(this, 'height', {
      get: function() { return this.sprite.height; }
    });

    this.updatePosition = function() {
      var driftX, driftY, thrustX, thrustY, thrust
        , that = this;

      if (controlStates.thrust) {
        // let's math this shit
        thrust = 0.2;

        driftX = this.speed*Math.cos(driftAngle);
        driftY = this.speed*Math.sin(driftAngle);
        thrustX = thrust*Math.cos(this.angle);
        thrustY = thrust*Math.sin(this.angle);

        driftX += thrustX;
        driftY += thrustY;

        this.speed = Math.sqrt(Math.pow(driftX, 2) + Math.pow(driftY, 2));
        driftAngle = Math.acos(driftX / this.speed);
        if (Math.asin(driftY / this.speed) < 0) {
          driftAngle *= -1;
        }
      }

      if (controlStates.turnLeft) {
        this.angle -= 0.1;
      }

      if (controlStates.turnRight) {
        this.angle += 0.1;
      }

      this.x += this.speed*Math.cos(driftAngle);
      this.y += this.speed*Math.sin(driftAngle);

      this.speed *= 0.99;
    };

    this.render = function() {
      return this.sprite.render();
    };

    this.controls = {
      '38': {
        keydown: function() {
          if (!controlStates.thrust) {
            controlStates.thrust = true;
            that.sprite = spriteThrusting;
          }
        },
        keyup: function() {
          if (controlStates.thrust) {
            controlStates.thrust = false;
            that.sprite = spriteNormal;
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
      },

      '32': {
        keydown: function() {
          var itemBoost = 3
            , itemSpeedX = that.speed*Math.cos(driftAngle) + itemBoost*Math.cos(that.angle)
            , itemSpeedY = that.speed*Math.sin(driftAngle) + itemBoost*Math.sin(that.angle)
            , itemSpeed = Math.sqrt(Math.pow(itemSpeedX, 2) + Math.pow(itemSpeedY, 2));

          Game.addObject(new Game.Missile({
            x: that.x + 0.5*that.height,
            y: that.y,
            angle: that.angle,
            speed: itemSpeed
          }));
        }
      }
    };

    controlStates = {
      thrust: false,
      turnLeft: false,
      turnRight: false
    };

    this.addTrigger({
      condition: function() {
        return that.health <= 0;
      },
      action: function() {
        Game.lives--;
        that.blowUp();
        setTimeout(function() {
          Game.respawn();
        }, 2000);
      }
    })
  };

  return Game;
})(Game || {});
