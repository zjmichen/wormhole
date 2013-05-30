var socketio = require("socket.io")
  , redis = require("redis");

function SocketController() {
    var sio
      , rClient = redis.createClient()
      , numPlayers = 4
      , nextTeam = 0;

    /** callback declarations for individual sockets */
    function SocketHandler(socket) {
        socket.on("disconnect", function() {
            console.log("Socket disconnected: " + socket.id);
        });

        socket.on("ready", function() {
            console.log("Client is ready.");

            _SocketController.enqueue(socket.id);
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

         /** add player to play queue */
         "enqueue": function(socketId) {
            rClient.llen("playQueue", function(err, numQueued) {
                if (numQueued >= numPlayers - 1) {
                    var players = [];
                    players.push(socketId);

                    rClient.lpop("playQueue", function(err, player1) {
                        players.push(player1);
                        rClient.lpop("playQueue", function(err, player2) {
                            players.push(player2);
                            rClient.lpop("playQueue", function(err, player3) {
                                players.push(player3);

                                players.forEach(function(socketId){
                                    sio.sockets.sockets[socketId].emit("go", {
                                        "team": nextTeam,
                                    });
                                });

                                nextTeam += 1;

                            });
                        });
                    });
                } else {
                    rClient.rpush("playQueue", socketId);
                    sio.sockets.sockets[socketId].emit("wait");
                }
            });
         },

    };

    return _SocketController;
}

module.exports = SocketController;