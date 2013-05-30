var socketio = require("socket.io");

function SocketController() {
    var sio;

    /** callback declarations for individual sockets */
    function SocketHandler(socket) {
        socket.on("disconnect", function() {
            console.log("Socket disconnected: " + socket.id);
        });

        socket.on("ready", function() {
            console.log("Client is ready.");
            socket.emit("ackReady");
        });
    }

    /** public members/methods */
    var _SocketController = {

        /** set up global socket handler */
        "init": function(server) {
            sio = socketio.listen(server);
            sio.sockets.on("connection", function(socket) {
                var sHandler = new SocketHandler(socket);
            });
         },

    };

    return _SocketController;
}

module.exports = SocketController;