function SocketController() {
    var socket = new io.connect(window.location.host)
      , players = [];

    var _SocketController = {

        /** client is ready to interact with server */
        "ready": function() {
            socket.emit("ready");

            socket.on("wait", this.wait);
            socket.on("go", this.go);
            socket.on("msg", this.receive);
        },

        "wait": function() {
            console.log("Server said wait.");
        },

        "go": function(data) {
            console.log("Server said go.");
            console.log(data);

            players = data.players;

            players.forEach(function(player, i) {
                $("body").append("<button name='" + player + "' class='btnPlayer'>Player " + (i+1) + "</button>");
            });

            $("#btnPlay").hide();

            $(".btnPlayer").click(function() {
                socket.emit("msg", {
                    "player": $(this).attr("name"),
                });
            });

        },

        "receive": function(data) {
            console.log("Message from player " + (players.indexOf(data.from) + 1));
        },

        "send": function(data) {

        },

    };

    return _SocketController;

}

$(document).ready(function() {
    var socketCon = SocketController();

    $("#btnPlay").click(function() {
        console.log("Button pressed");
        socketCon.ready();
    });
});