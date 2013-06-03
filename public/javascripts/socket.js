window.socket;

function SocketController() {
    var socket = new io.connect(window.location.host)
      , players = []
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
        },

        "go": function(data) {
            console.log("Server said go.");

            otherPlayers = data.players;
            thisPlayer = data.you;

            game = new Game(thisPlayer, otherPlayers);

            game.play();

            $("#btnPlay").hide();


        },

        "send": function(to, data) {
            data = data || {};
            data.player = to;
            console.log("Sending data");
            socket.emit("msg", data);
        },

        "receive": function(data) {
            console.log("Message from player " + (players.indexOf(data.from) + 1));
            game.receiveData(data);
        },

        "playerQuit": function(data) {
            var i = players.indexOf(data.player);
            if (i >= 0) {
                players.splice(i, 1);
                game.removePlayer(data.player);
            }
        },

    };

    return _SocketController;

}

$(document).ready(function() {
    window.socket = SocketController();

    $("#btnPlay").click(function() {
        console.log("Button pressed");
        window.socket.ready();
    });
});