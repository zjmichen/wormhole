var Game = (function(Game) {
  var types = {
    'nuke': {
      prob: 0.1,
      img: new Image(),
      constructor: Game.Nuke
    },
    'missile': {
      prob: 0.9,
      img: new Image(),
      constructor: Game.Missile
    },
    'none': {
      prob: 0,
      img: new Image(),
      constructor: Game.Explosion
    }
  };

  for (var type in types) {
    types[type].img.src = '/images/item_' + type + '.png';
  }

  Game.Arsenal = {

    getRandomType: function() {
      var r = Math.random()
        , probSum = 0
        , threshhold = 0;

      for (var weapon in types) {
        if (r < probSum + types[weapon].prob) {
          return weapon;
        }

        probSum += types[weapon].prob;
      };
    },

    getImage: function(type) {
      if (types[type] === undefined) {
        return null;
      }

      return types[type].img;
    },

    getConstructor: function(type) {
      return types[type].constructor;
    }

  };

  return Game;
})(Game || {});
