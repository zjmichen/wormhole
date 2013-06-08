window.socket;

function SocketController() {
    var socket = new io.connect(window.location.host)
      , otherPlayers = []
      , thisPlayer
      , game
      , gameListUpdate;

    /** public members/methods */
    var _SocketController = {

        "joinLobby": function() {
            $(".content").replaceWith($("#loading"));

            gameListUpdate = setInterval(function() {
                socket.emit("getGameList");
            }, 1000);

            socket.on("gameList", this.updateGameList);
        },

        "ready": function(numPlayers) {
            socket.emit("ready", {
                "players": numPlayers,
            });

            socket.on("wait", this.wait);
            socket.on("go", this.go);
            socket.on("msg", this.receive);
            socket.on("quit", this.playerQuit);
            socket.on("wormhole", this.wormhole);
        },

        "newGame": function(game, numPlayers) {
            console.log("Creating a game of " + game + " with " + numPlayers);
            socket.emit("newGame", {
                "name": game,
                "numPlayers": numPlayers,
            });
        },

        "wait": function() {
            console.log("Server said wait.");
            $("#btnPlay").replaceWith($("<button disabled='disabled' class='btn btn-large btn-primary'>Waiting...</button>"));
        },

        "go": function(data) {
            console.log("Server said go.");

            otherPlayers = data.players;
            thisPlayer = data.you;

            game = new Game(thisPlayer, otherPlayers);

            $("#btnPlay").hide();
            window.scrollTo(0, 0);
            $("#wormhole").fadeIn();

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

        "updateGameList": function(games) {
            $("#roomList").replaceWith("<ul id='roomList'></ul>").show();
            for (var game in games) {
                game = JSON.parse(games[game]);
                // $("#roomList").append("<li class='" + game.status + "'>" + 
                //         game.name + " (" + game.numPlayers + ")" +
                //         "<button type='button' class='join' data-game='" + 
                //         game.name + "'>Join</button>");
                $("#roomList").append(Mustache.to_html($("#gameInfo").html(), game));
            }
        },

    };

    return _SocketController;

}

$(document).ready(function() {
    window.socket = SocketController();

    var waitingBtn = $("<div class='center'><button class='btn btn-large btn-primary' disabled='disabled'>Waiting for players...</button></div>");

    $("#btnPlay").click(function() {
        window.socket.joinLobby();

        $("#waitingArea").show();
        $("#btnAddRoom").click(function() {
            window.socket.newGame($("#newRoom").val(), $("#newRoomSize").val());
        });
    });

});