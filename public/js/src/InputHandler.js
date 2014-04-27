var W = (function(W) {
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

  W.InputHandler = {
    addKeyInput: function(keyCode, controls) {
      console.log('Adding key input for ' + keyCode);
      if (isNaN(parseInt(keyCode))) {
        keyCode = codes[keyCode];
      }

      for (var evtType in controls) {
        console.log('Adding control ' + evtType);
        if (keyListeners[evtType] === undefined) {
          console.log('Creating new listener on ' + evtType);
          keyListeners[evtType] = [];
          document.addEventListener(evtType, keyListener);
        }

        keyListeners[evtType].push({keyCode: keyCode, action: controls[evtType]});
        console.log('Listeners so far: ' + keyListeners);
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

  function keyListener(e) {
    var evtType = e.type;
    keyListeners[evtType].forEach(function(listener) {
      if (e.keyCode === listener.keyCode) {
        listener.action();
      }
    });
  }

  return W;
})(W || {});
