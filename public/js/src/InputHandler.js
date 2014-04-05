var Game = (function(Game) {
  var codes, alphabet, keyListeners;

  codes = {
    'space': 32,
    'left': 37,
    'up': 38,
    'right': 39
  };

  alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 26; i++) {
    codes[alphabet.substring(i, i+1)] = 65 + i;
  }

  keyListeners = {};

  Game.InputHandler = function() {
    this.addKeyInput = function(keyCode, controls) {
      var that = this;

      if (isNaN(parseInt(keyCode))) {
        keyCode = codes[keyCode];
      }

      for (var evtType in controls) {
        if (keyListeners[evtType] === undefined) {
          keyListeners[evtType] = [];
          document.addEventListener(evtType, keyListener);
        }

        keyListeners[evtType].push({
          keyCode: keyCode,
          action: controls[evtType],
          owner: that
        });
      }
    };

    this.removeHandlers = function() {
      var numRemoved = 0
        , that = this;

      console.log(keyListeners);
      for (var evtType in keyListeners) {
        keyListeners[evtType].forEach(function(listener, i, arr) {
          if (listener.owner === that) {
            numRemoved++;
            arr.splice(arr.indexOf(listener), 1);
          }
        });
      }

      console.log("Removed " + numRemoved + " event handlers.");
      console.log(keyListeners);
    };

    this.addInput = function(controls) {
      for (var evtType in controls) {
        document.addEventListener(evtType, function(e) {
          controls[e.type](e);
        });
      }
    };
  };

  function keyListener(e) {
    var evtType = e.type;
    keyListeners[evtType].forEach(function(listener) {
      if (e.keyCode === listener.keyCode) {
        listener.action.call(listener.owner);
      }
    });
  }

  Game.keyListeners = keyListeners;

  return Game;
})(Game || {});
