var W = (function(W) {
  var buf = document.createElement('canvas')
    , ctx = buf.getContext('2d');

  W.GameObject = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
    scaleTarget: 1,
    scaleSpeed: 0.5,
    angle: 0,
    speed: 0,
    triggers: undefined,
    type: 'object',

    update: function(gameObjects) {
      var that = this;

      this.updatePosition();
      this.updateScale();
      this.updateExtra();
      this.processTriggers();

      gameObjects.forEach(function(obj) {
        that.interactWith(obj);
      });

      if (this.sprite) {
        this.sprite.update();
      }
    },

    updateScale: function() {
      this.scale += this.scaleSpeed*(this.scaleTarget - this.scale);
    },

    updatePosition: function() {
      this.x += this.speed*Math.cos(this.angle);
      this.y += this.speed*Math.sin(this.angle);
    },

    updateExtra: function() {
    },

    render: function() {
      if (this.sprite && typeof this.sprite.render === 'function') {
        return this.sprite.render();
      } else {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = '#777';
        ctx.fillRect(0, 0, this.width, this.height);

        return buf;
      }
    },

    scaleTo: function(target, next) {
      var that = this
        , threshhold = 0.0001;

      this.scaleTarget = target;
      if (typeof next === 'function') {
        this.addTrigger({
          condition: function() {
            return Math.abs(that.scale - that.scaleTarget) < threshhold;
          },
          action: next
        });
      }
    },

    processTriggers: function() {
      if (this.triggers === undefined) { return; }

      this.triggers.forEach(function(trigger, i, triggerArr) {
        if (trigger.condition()) {
          trigger.action();
          if (!trigger.repeat) {
            triggerArr.splice(i, 1);
          }
        }
      });
    },

    addTrigger: function(trigger) {
      if (this.triggers === undefined) {
        this.triggers = [];
      }

      this.triggers.push(trigger);
    },

    interactWith: function(obj) {
    },

    distanceTo: function(obj) {
      return Math.sqrt(Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2));
    },

    turnToward: function(obj, amount) {
      var dy = obj.y - this.y
        , dx = obj.x - this.x
        , objAngle = Math.atan( (obj.y - this.y) /
                                (obj.x - this.x) );

      if (dx < 0) {
        objAngle += Math.PI;
      } else if (dy < 0) {
        objAngle += 2*Math.PI;
      }

      if (Math.abs(dy) < objAngle - this.angle) {
        amount = 1;
      }

      this.angle += amount*(objAngle - this.angle);
    },

    blowUp: function() {
      var that = this;

      W.addObject(new W.Explosion({
        x: that.x,
        y: that.y
      }));

      W.removeObject(this);
    },

  };

  return W;
})(W || {});
