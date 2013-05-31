var socketio = require("socket.io")
  , redis = require("redis");

function SocketController() {
    var sio
      , rClient = redis.createClient()
      , playersPerGame = 3
      , nextGameId = 0;

    rClient.flushall();

    /** callback declarations for individual sockets */
    function SocketHandler(socket) {
        socket.on("disconnect", function() {
            console.log("Socket disconnected: " + socket.id);
        });

        socket.on("ready", function() {
            console.log("Client is ready.");

            _SocketController.enqueue(socket.id);
        });

        socket.on("msg", function(data) {
            console.log("Message from " + socket.id + " to " + data.player);
            sio.sockets.sockets[data.player].emit("msg", {
                "from": socket.id,
            });
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
            var that = this;
            rClient.llen("playQueue", function(err, numQueued) {
                if (numQueued >= playersPerGame - 1) {

                    that.createGame(socketId);

                } else {
                    rClient.rpush("playQueue", socketId);
                    sio.sockets.sockets[socketId].emit("wait");
                }
            });
         },

         /** removes players from play queue and creates a game */
         "createGame": function(lastPlayer) {
            rClient.lrange("playQueue", 0, playersPerGame - 1, function(err, players) {
                var gameId = nextGameId;
                nextGameId += 1;

                rClient.ltrim("playQueue", playersPerGame, -1);

                players.push(lastPlayer);

                players.forEach(function(socketId) {
                    var otherPlayers = players.filter(function(playerId) {
                        return (playerId !== socketId);
                    });

                    sio.sockets.sockets[socketId].emit("go", {
                        "gameId": gameId,
                        "players": otherPlayers,
                    });
                });

                rClient.hset("players", "game" + gameId, players);
            });
         },

    };

    return _SocketController;
}

module.exports = SocketController;