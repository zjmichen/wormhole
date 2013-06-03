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

            data = data || {};
            data.from = socket.id;

            if (sio.sockets.sockets[data.player] === undefined) {
                socket.emit("quit", {
                    "player": data.player,
                });
            } else {
                sio.sockets.sockets[data.player].emit("msg", data);
            }
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

         /** add player to play queue, start game if enough players */
         "enqueue": function(socketId) {
            var that = this;
            rClient.llen("playQueue", function(err, numQueued) {
                var players = [];
                if (numQueued >= playersPerGame - 1) {
                    players.push(socketId);
                    (function getPlayers() {
                        if (numQueued + players.length < playersPerGame) {
                            console.log("Not enough players, reverting.");

                            players.forEach(function(socketId) {
                                rClient.rpush("playQueue", socketId);
                            });
                            return;
                        } else if (players.length >= playersPerGame) {
                            console.log("Found enough players.");

                            that.createGame(players);
                            return;
                        } else {
                            console.log("Fetching another player...");
                            rClient.lpop("playQueue", function(err, socketId) {
                                numQueued -= 1;
                                if (sio.sockets.sockets[socketId] !== undefined) {
                                    players.push(socketId);

                                    getPlayers();
                                }
                            });
                        }
                    })();
                } else {
                    rClient.rpush("playQueue", socketId);
                    sio.sockets.sockets[socketId].emit("wait");
                }
            });
         },

         /** creates a game with players */
         "createGame": function(players) {
            players.forEach(function(socketId, i) {
                var otherPlayers = players.filter(function(playerId) {
                    return (playerId !== socketId);
                });

                if (sio.sockets.sockets[socketId] === undefined) {
                    players.splice(i, 1);
                    for (var j = 0; j < i; j++) {
                        sio.sockets.sockets[players[j]].emit("quit", {
                            "player": socketId,
                        });
                    }
                } else {
                    sio.sockets.sockets[socketId].emit("go", {
                        "gameId": gameId,
                        "players": otherPlayers,
                    });
                }
            });

            var gameId = nextGameId;
            nextGameId += 1;

            rClient.hset("players", "game" + gameId, players);
         },

    };

    return _SocketController;
}

module.exports = SocketController;