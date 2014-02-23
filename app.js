var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path')
  , credentials = {}
  , redis = require('redis')
  , GameController = require('./controllers/GameController.js')
  , gameCon;

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  console.log("Running in development environment");
  app.use(express.errorHandler());
  credentials.redisHost = "127.0.0.1";
  credentials.redisPort = 6379;
  credentials.redisPass = "";
}

if ('production' == app.get('env')) {
  console.log("Running in production environment");
  credentials.redisHost = process.env.REDIS_HOST;
  credentials.redisPort = process.env.REDIS_PORT;
  credentials.redisPass = process.env.REDIS_PASS;
}

redisClient = redis.createClient(credentials.redisPort, credentials.redisHost);
redisClient.auth(credentials.redisPass, function(err) {
  if (err) { throw err; }
});

redisClient.flushall();

gameCon = new GameController(redisClient);

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/games/:gameid', function(req, res) {
  var players = gameCon.getPlayers(req.params.gameid, function(err, players) {
    if (err) {
      console.log(err);
      res.send(500, err);
    }
    else {
      res.render('game', {
        id: req.params.gameid,
        players: players
      });
    };
  });
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  socket.on('present', function(gameid) {
    socket.set('gameid', gameid);
    socket.join(gameid);
  });

  socket.on('message', function echo(data) {
    console.log('Got message from ' + socket.id + ': ' + data);
  });

  socket.on('join', function(gameid) {
    gameCon.addPlayer(socket.id, gameid);
    socket.broadcast.to(gameid).emit('playerJoined', socket.id);
  });

  socket.on('disconnect', function() {
    socket.get('gameid', function(err, gameid) {
      if (err) { console.log(err); }

      socket.broadcast.to(gameid).emit('playerLeft', socket.id);
      socket.leave(gameid);
      gameCon.removePlayer(socket.id, gameid);
    });

  });
});

