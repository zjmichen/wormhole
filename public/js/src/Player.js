var Game = (function(Game) {
  Game.Player = {
    lives: 3,
    items: [],
    health: 100,
    ship: undefined
  };

  return Game;
})(Game || {});