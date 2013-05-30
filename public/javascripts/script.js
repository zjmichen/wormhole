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
        });
    });
});