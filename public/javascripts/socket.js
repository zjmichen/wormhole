window.socket;

function SocketController() {
    var socket = new io.connect(window.location.host)
      , otherPlayers = []
      , thisPlayer
      , game;

    /** public members/methods */
    var _SocketController = {

        /** client is ready to interact with server */
        "ready": function() {
            socket.emit("ready");

            socket.on("wait", this.wait);
            socket.on("go", this.go);
            socket.on("msg", this.receive);
            socket.on("quit", this.playerQuit);

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
                })
            });
        },

        "receive": function(data) {
            var obj = JSON.parse(data.data);
            obj.from = data.from;
            game.receiveData(obj);
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

$(document).ready(function() {
    window.socket = SocketController();

    $("#btnPlay").click(function() {
        window.socket.ready();
    });
});