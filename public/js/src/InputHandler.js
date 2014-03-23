var Game = (function(Game) {

  Game.InputHandler = {
    addKeyInput: function(keyCode, controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          if (e.keyCode === parseInt(keyCode)) {
            controls[e.type]();
          }
        });
      }
    },

    addInput: function(controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          controls[e.type](e);
        });
      }
    }
  };

  return Game;
})(Game || {});
