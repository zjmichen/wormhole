var Game = (function(Game) {
  Game.Player = {
    lives: 3,
    items: [],
    health: 100,
    ship: undefined,

    respawn: function() {
      if (this.lives <= 0) {
        Game.lose();
        return;
      }

      this.ship = new Game.Ship(0.5*Game.Canvas.width, 0.5*Game.Canvas.height);

      this.lives--;
      this.health = 100;
      this.items = [];

      Game.addObject(this.ship);
    }
  };

  return Game;
})(Game || {});
