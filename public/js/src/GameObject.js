var Game = (function(Game) {
  var buf = document.createElement('canvas')
    , ctx = buf.getContext('2d');

  Game.GameObject = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
    scaleTarget: 1,
    scaleSpeed: 0.5,
    angle: 0,
    speed: 0,
    triggers: [],

    update: function() {
      this.updatePosition();
      this.updateScale();
      this.processTriggers();

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

    render: function() {
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#777';
      ctx.fillRect(0, 0, this.width, this.height);

      return buf;
    },

    scaleTo: function(target, next) {
      var that = this;
      this.scaleTarget = target;
      this.triggers.push({
        condition: function() {
          return that.scale === that.scaleTarget;
        },
        action: next,
        selfDestruct: true
      });
    },

    processTriggers: function() {
      this.triggers.forEach(function(trigger, i, triggerArr) {
        if (trigger.condition()) {
          trigger.action();
          if (trigger.selfDestruct) {
            triggerArr.splice(i, 1);
          }
        }
      });
    }
  };

  return Game;
})(Game || {});
