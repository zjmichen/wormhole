var redis = require('redis');

function GameController() {
    // private members and initialization
    var numGames = 0
      , rClient = redis.createClient();

    // public members
    var _GameController = {

        /** enqueues a player to start a game */
        "enqueue": function(req, res) {

        },

        // assigns client to a game, redirects
        "startGame": function(req, res) {
            numGames += 1;
            console.log(numGames);
            res.render("game", {"gameId": "1"})
        },

    };

    return _GameController;
}

module.exports = GameController;