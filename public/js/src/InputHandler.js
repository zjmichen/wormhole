var Game = (function(Game) {
  var codes = {
    'space': 32,
    'left': 37,
    'up': 38,
    'right': 39
  };

  Game.InputHandler = {
    addKeyInput: function(keyCode, controls) {
      if (isNaN(parseInt(keyCode))) {
        keyCode = codes[keyCode];
      }

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
