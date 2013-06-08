var socketio = require("socket.io")
  , redis = require("redis");

function SocketController() {
    var sio
      , nextGameId = 0
      , playersPerGame = 2
      , rClient;

    /** callback declarations for individual sockets */
    function SocketHandler(socket) {
        socket.on("disconnect", function() {
            console.log("Socket disconnected: " + socket.id);
            sio.sockets.in(socket.room).emit("quit", {
                "player": socket.id,
            });
        });

        socket.on("joinLobby", function() {
            _SocketController.joinLobby(socket);
        });

        socket.on("getGameList", function() {
            _SocketController.sendGameList(socket);
        });

        socket.on("newGame", function(gameInfo) {
            _SocketController.createGame(socket, gameInfo);
        });

        socket.on("joinGame", function(gameName) {

        });

        socket.on("wormhole", function() {
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

        socket.on("msg", function(data) {
            console.log("Message from " + socket.id + " to " + data.player);

        });

        socket.on("quit", function(data) {
            sio.sockets.in(socket.room).emit("quit", {
                "player": socket.id,
            });
        });
    }

    /** public members/methods */
    var _SocketController = {

        /** set up global socket handler */
        "init": function(server, credentials) {
            rClient = redis.createClient(credentials.redisPort, credentials.redisHost);
            rClient.auth(credentials.redisPass, function(err) {
                if (err) {
                    console.log("Oh shit, redis barfed!");
                    throw err;
                } else {
                    console.log("Redis auth'd.");
                }
            });

            sio = socketio.listen(server);
            sio.sockets.on("connection", function(socket) {
                var sHandler = new SocketHandler(socket);
            });
         },

         /** add player to play queue, start game if enough players */
         "enqueue": function(socketId, gameName) {
            var that = this;

            rClient.hget("games", gameName, function(gameInfo) {
                var playersPerGame = gameInfo.numPlayers;
              
                rClient.llen("queue-" + gameName, function(err, numQueued) {
                    var players = [];
                    if (numQueued >= playersPerGame - 1) {
                        players.push(socketId);
                        (function getPlayers() {
                            if (numQueued + players.length < playersPerGame) {
                                console.log("Not enough players, reverting.");

                                players.forEach(function(socketId) {
                                    rClient.rpush("queue-" + gameName, socketId);
                                });
                                return;
                            } else if (players.length >= playersPerGame) {
                                console.log("Found enough players.");

                                gameInfo.status = "playing";
                                rClient.hset("games", gameName, gameInfo, function(err) {
                                    that.startGame(players);
                                });
                                return;
                            } else {
                                console.log("Fetching another player...");
                                rClient.lpop("queue-" + gameName, function(err, socketId) {
                                    numQueued -= 1;
                                    if (sio.sockets.sockets[socketId] !== undefined) {
                                        players.push(socketId);

                                        getPlayers();
                                    }
                                });
                            }
                        })();
                    } else {
                        rClient.rpush("queue-" + gameName, socketId);
                        sio.sockets.sockets[socketId].emit("wait");
                    }
                });
            });
         },

         /** creates a game with players */
         "startGame": function(players) {
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
                    sio.sockets.sockets[socketId].leave("lobby");
                    sio.sockets.sockets[socketId].emit("go", {
                        "players": otherPlayers,
                        "you": socketId,
                    });
                }
            });

         },

         "joinLobby": function(socket) {
            socket.join("lobby");
            this.sendGameList(socket);
         },

         "sendGameList": function(socket) {
            rClient.hgetall("games", function(err, gameList) {
                console.log(gameList);
                socket.emit("gameList", gameList);
            });
         },

         "createGame": function(socket, gameInfo) {
            var that = this;
            console.log("Creating game:");
            console.log(gameInfo);
            rClient.hget("games", gameInfo.name, function(err, game) {
                if (game) {
                    socket.emit("error", {"message": "Game exists"});
                } else {
                    gameInfo.status = "waiting";
                    rClient.hset("games", gameInfo.name, JSON.stringify(gameInfo), function(err) {
                        console.log("Game added");
                        socket.join("game-" + gameInfo.name);
                        //that.enqueue(socket.id, gameInfo.name);
                    });
                }
            });
         },

         "joinGame": function(socket, gameName) {
            var that = this;
            rClient.hget("games", gameName, function(err, game) {
                if (game) {
                    game = JSON.parse(game);
                    if (game.status !== "waiting") {
                        socket.emit("error", {"message": "Game is not open"});
                    } else {
                        that.enqueue(socket.id, gameInfo.name);
                    }
                } else {
                    socket.emit("error", {"message": "Game does not exist"});
                }
            });
         },

    };

    return _SocketController;
}

module.exports = SocketController;