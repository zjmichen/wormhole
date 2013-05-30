$(document).ready(function() {
    var socket = new io.connect(window.location.host);

    $("#btnPlay").click(function() {
        console.log("Button pressed");
        socket.emit("ready");

        socket.on("wait", function() {
            console.log("Server said wait.");
        });

        socket.on("go", function(data) {
            console.log("Server said go.");
            console.log(data);

            var players = data.players;

            players.forEach(function(player, i) {
                $("body").append("<button name='" + player + "' class='btnPlayer'>Player " + (i+1) +
                    "</button>");
            });

            $("#btnPlay").hide();

            $(".btnPlayer").click(function() {
                socket.emit("msg", {
                    "player": $(this).attr("name"),
                });
            });

            socket.on("msg", function(data) {
                console.log("Message from player " + (players.indexOf(data.from) + 1));
            });
        });
    });
});