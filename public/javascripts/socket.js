window.socket;

function SocketController() {
    var socket = new io.connect(window.location.host)
      , players = []
      , game;

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
            console.log(data);

            players = data.players;

            game = new Game(players, this);

            game.play();

            // players.forEach(function(player, i) {
            //     $("body").append("<button name='" + player + "' class='btnPlayer'>Player " + (i+1) + "</button>");
            // });

            $("#btnPlay").hide();

            // $(".btnPlayer").click(function() {
            //     that.send($(this).attr("name"));
            //     socket.emit("msg", {
            //         "player": $(this).attr("name"),
            //     });
            // });

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
    window.socket= SocketController();

    $("#btnPlay").click(function() {
        console.log("Button pressed");
        window.socket.ready();
    });
});