var socketio = require("socket.io")
  , redis = require("redis");

function SocketController() {
    var sio
      , nextGameId = 0
      , playersPerGame = 3
      , rClient = redis.createClient();

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

        socket.on("quit", function(data) {
            console.log(data.player + " quit.");
            console.log(sio.sockets.in(socket.game));
            sio.sockets.in(socket.room).emit("quit", {
                "player": socket.id,
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
                    var game = "game" + nextGameId;
                    sio.sockets.sockets[socketId].join(game);
                    nextGameId += 1;
                    sio.sockets.sockets[socketId].emit("go", {
                        "players": otherPlayers,
                        "you": socketId,
                    });
                }
            });

         },

    };

    return _SocketController;
}

module.exports = SocketController;