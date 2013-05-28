function GameController() {
    // private members and initialization
    var numGames = 0;

    // public members
    var _GameController = {

        // assigns client to a game, redirects
        "startGame": function(req, res) {
            numGames += 1;
            console.log(numGames);
            res.redirect("/");
        }

    };

    return _GameController;
}

module.exports = GameController();