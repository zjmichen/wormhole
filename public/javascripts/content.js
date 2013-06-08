window.socket;
window.contents;

$(document).ready(function() {
    var content = new ContentController();

    content.init();
});

function ContentController() {
    var _ContentController
      , gameListUpdate;

    _ContentController = {

        "init": function() {
            window.socket = SocketController();
            window.contents = this;
            $("button#joinLobby").click(this.joinLobby);
        },

        "joinLobby": function() {
            $("#intro").fadeOut();
            $("#lobby").fadeIn(function() {
                window.socket.joinLobby();

                gameListUpdate = setInterval(function() {
                    window.socket.getGameList();
                }, 2000);

                $(".join").click(this.joinGame);
                $("button#newGame").click(this.createGame);
            });
        },

        "joinGame": function() {
            var gameName = $(this).attr("data-game");
            window.socket.joinGame(gameName);
        },

        "createGame": function() {
            var gameName = $("input#newGameName").val()
              , numPlayers = $("input#newGamePlayers").val();

            window.socket.newGame(gameName, numPlayers);
        },

        "updateGameList": function(games) {
            $("ul#gameList").html("");
            for (var game in games) {
                game = JSON.parse(games[game]);
                $("ul#gameList").append(Mustache.to_html($("#gameInfo").html(), game));
            }
        },

        "startGame": function() {
            clearInterval(gameListUpdate);
            window.scrollTo(0, 0);
            $("canvas#wormhole").fadeIn();
        },

    };

    return _ContentController;
}