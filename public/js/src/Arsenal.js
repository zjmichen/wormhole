var Game = (function(Game) {
  var types = {
    'nuke': {
      prob: 0.1,
      img: new Image()
    },
    'missile': {
      prob: 0.9,
      img: new Image()
    },
    'none': {
      prob: 0,
      img: new Image()
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
          console.log('Yes.');
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
    }

  };

  return Game;
})(Game || {});
