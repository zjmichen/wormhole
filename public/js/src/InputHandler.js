var Game = (function(Game) {
  var codes = {
    'space': 32,
    'left': 37,
    'up': 38,
    'right': 39
  };

  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 26; i++) {
    codes[alphabet.substring(i, i+1)] = 65 + i;
  }

  console.log(codes);

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
