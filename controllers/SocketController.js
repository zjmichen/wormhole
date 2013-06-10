var socketio = require("socket.io")
  , redis = require("redis");

function SocketController() {
    var sio
      , nextGameId = 0
      , playersPerGame = 2
      , rClient;


    var joinLobby = function(socket) {
        socket.join("lobby");
        sendGameList(socket);
    };

    var sendGameList = function(socket) {
        rClient.hgetall("games", function(err, gameList) {
            console.log(gameList);
            socket.emit("gameList", gameList);
        });
    };

    var createGame = function(socket, gameInfo) {
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
                });
            }
        });
    };

    var joinGame = function(socket, gameName) {
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
    };

    var wormhole = function(socket, data) {
        data = data || {};
        data.from = socket.id;

        if (sio.sockets.sockets[data.player] === undefined) {
            socket.emit("quit", {
                "player": data.player,
            });
        } else {
            sio.sockets.sockets[data.player].emit("msg", data);
        }
    };

    var quit = function() {
        sio.sockets.in(socket.room).emit("quit", {
            "player": socket.id,
        });
    };

    var _SocketController = {

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

            rClient.flushall();

            sio = socketio.listen(server);
            sio.sockets.on("connection", this.initSocket);

         },

         "initSocket": function(socket) {
            socket.on("joinLobby", function() {
                joinLobby(socket)
            });
            socket.on("getGameList", function() {
                sendGameList(socket);
            });
            socket.on("newGame", function(gameInfo) {
                createGame(socket, gameInfo);
            });
            socket.on("joinGame", function(game) {
                joinGame(socket, game);
            });
            socket.on("wormhole", function(data) {
                wormhole(socket, data);
            });
            socket.on("quit", function() {
                quit(socket);
            });
            socket.on("disconnect", function() {
                console.log("Socket disconnected: " + socket.id);
                sio.sockets.in(socket.room).emit("quit", {
                    "player": socket.id,
                });
            });
         },

 
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


    };

    return _SocketController;
}

module.exports = SocketController;
