function GameController(redis) {
  var interface = {
    addPlayer: function(socketid, gameid) {
      console.log("Adding socket " + socketid + " to game-" + gameid);
      redis.sadd('game-' + gameid, socketid);
    },

    removePlayer: function(socketid, gameid) {
      redis.srem("game-" + gameid, socketid);
    },

    getPlayers: function(gameid, next) {
      redis.smembers('game-' + gameid, next);
    },

    isInGame: function(playerid, gameid, next) {
      redis.sismember('game-' + gameid, playerid, next);
    }
  };

  return interface;
}

module.exports = GameController;
