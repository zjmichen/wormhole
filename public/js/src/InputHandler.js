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

    this.addMouseInput = function(controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          controls[e.type](e);
        });
      }
    };
  };

  return Game;
})(Game || {});
