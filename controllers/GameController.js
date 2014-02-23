function GameController(redis) {
  var interface = {
    addPlayer: function(socketid, gameid) {
      console.log("Adding socket " + socketid + " to game " + gameid);
    }
  }

  return interface;
}

module.exports = GameController;
