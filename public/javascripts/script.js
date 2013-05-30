$(document).ready(function() {
    var socket = new io.connect(window.location.host);

    $("#btnPlay").click(function() {
        console.log("Button pressed");
        socket.emit("ready");

        socket.on("ackReady", function() {
            console.log("Server said go.");
        });
    });
});