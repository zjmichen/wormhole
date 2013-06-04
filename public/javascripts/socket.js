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
            $("#btnPlay").html("Loading...");
            $("#btnPlay").addClass("disabled");
            $("#btnPlay").attr("disabled", "disabled");
        },

        "go": function(data) {
            console.log("Server said go.");

            otherPlayers = data.players;
            thisPlayer = data.you;

            game = new Game(thisPlayer, otherPlayers);

            $("#btnPlay").hide();
            $("#waiting").hide();
            $("#wormhole").show();

            game.play();
        },

        "send": function(to, data) {
            data = data || {};
            data.player = to;
            socket.emit("msg", data);
        },

        "receive": function(data) {
            game.receiveData(data);
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