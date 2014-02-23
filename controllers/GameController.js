function GameController(redis) {
  var interface = {
    addPlayer: function(socketid, gameid) {
      console.log("Adding socket " + socketid + " to game " + gameid);
      redis.lpush(gameid, socketid);
    },

    getPlayers: function(gameid, next) {
      redis.lrange(gameid, 0, -1, next);
    }
  }

  return interface;
}

module.exports = GameController;
