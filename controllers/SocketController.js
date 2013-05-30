var socketio = require("socket.io");

function SocketController() {
    var sio;

    var _SocketController = {
        "init": function(server) {
            sio = socketio.listen(server);
            sio.on("connection", this.connection);
        },

        "connection": function(client) {
            console.log("Connection acquired");
        },
    };

    return _SocketController;
}

module.exports = SocketController;