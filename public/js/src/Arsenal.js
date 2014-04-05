var Game = (function(Game) {
  var types = {
    'none': {
      prob: 0,
      img: new Image(),
      constructor: Game.Explosion
    }
  };

  Game.Arsenal = {

    getRandomType: function() {
      return 'nuke';
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
    },

    addType: function(typeObj) {
      if (typeof typeObj.img === "string") {
        var imgUrl = typeObj.img;
        typeObj.img = new Image();
        typeObj.img.src = imgUrl;
      }

      typeObj.img = typeObj.img || new Image();
      typeObj.prob = typeObj.prob || 0;
      types[typeObj.name] = typeObj;
    }

  };

  return Game;
})(Game || {});
