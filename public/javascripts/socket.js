function SocketController() {
    var socket
      , otherPlayers = []
      , thisPlayer
      , game
      , gameListUpdate;

    socket = new io.connect(window.location.host);

    var _SocketController = {

        "joinLobby": function() {
            socket.on("gameList", window.contents.updateGameList);
        },

        "getGameList": function() {
            socket.emit("getGameList");
        },

        "joinGame": function(name) {
            socket.emit("joinGame", name);
            this.waitForGame();
        },

        "newGame": function(game, numPlayers) {
            console.log("Creating a game of " + game + " with " + numPlayers);
            socket.emit("newGame", {
                "name": game,
                "numPlayers": numPlayers,
            });
            this.waitForGame();
        },

        "waitForGame": function() {
            socket.on("wait", function() {
                console.log("Server said wait.");
            });

            socket.on("go", this.startGame);
        },

        "startGame": function(data) {
            console.log("Server said go.");

            otherPlayers = data.players;
            thisPlayer = data.you;

            game = new Game(thisPlayer, otherPlayers);

            window.contents.startGame();

            game.play();
        },
        
        "send": function(to, obj) {
            obj = obj || {};
            socket.emit("msg", {
                "player": to,
                "from": thisPlayer,
                "data": JSON.stringify(obj, function(key, value) {
                    if (typeof value === "function") {
                        return undefined;
                    } else if (typeof value === "object" && value.type === "sprite") {
                        return {
                            "modeUrls": value.modeUrls,
                            "width": value.width,
                            "height": value.height,
                        }
                    } else {
                        return value;
                    }
                }),
            });
        },

        "wormhole": function(data) {
            var obj = JSON.parse(data.data);
            obj.from = data.from;
            game.receiveData(obj);
        },

        "receive": function(data) {
            console.log("Got a message:");
            console.log(data);
        },

        "playerQuit": function(data) {
            var i = otherPlayers.indexOf(data.player);
            if (i >= 0) {
                otherPlayers.splice(i, 1);
                game.removePlayer(data.player);
                console.log(data.player + " quit.");
            }
        },

        "quit": function() {
            socket.emit("quit", {
                "player": thisPlayer,
            });
        },

    };

    return _SocketController;

}

