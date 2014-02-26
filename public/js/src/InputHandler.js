var Game = (function(Game) {

  Game.InputHandler = function() {
    this.addKeyInput = function(keyCode, controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          if (e.keyCode === parseInt(keyCode)) {
            controls[e.type]();
          }
        });
      }
    };
  };

  return Game;
})(Game || {});
