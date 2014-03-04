function GameController(redis) {
  var interface = {
    addPlayer: function(socketid, gameid) {
      console.log("Adding socket " + socketid + " to game-" + gameid);
      redis.sismember('gamelist', gameid, function(err, gameExists) {
        if (!gameExists) {
          redis.sadd('gamelist', gameid);
        }

        redis.sadd('game-' + gameid, socketid);
      });
    },

    removePlayer: function(socketid, gameid) {
      redis.srem('game-' + gameid, socketid, function(err) {
        redis.smembers('game-' + gameid, function(err, players) {
          if (err) { console.log(err); }

          if (players.length === 0) {
            redis.srem('gamelist', gameid);
          }
        });
      });
    },

    getPlayers: function(gameid, next) {
      redis.smembers('game-' + gameid, next);
    },

    isInGame: function(playerid, gameid, next) {
      redis.sismember('game-' + gameid, playerid, next);
    },

    getGames: function(next) {
      redis.smembers('gamelist', next);
    },

    createGame: function(next) {
      redis.get('nextGameId', function(err, gameid) {
        redis.incr('nextGameId');
        redis.sadd('gamelist', gameid);

        next(err, gameid);
      });
    }
  };

  return interface;
}

module.exports = GameController;
