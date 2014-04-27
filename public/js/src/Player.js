var W = (function(W) {
  W.Player = {
    lives: 3,
    items: [],
    health: 100,
    ship: undefined,

    respawn: function() {
      if (this.lives <= 0) {
        W.lose();
        return;
      }

      this.ship = new W.Ship(0.5*W.Canvas.width, 0.5*W.Canvas.height);

      this.lives--;
      this.health = 100;
      this.items = [];

      W.addObject(this.ship);
    }
  };

  return W;
})(W || {});
