var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path')
  , credentials = {};

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

app.get('/', function(req, res) {
  res.render('index');
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  socket.on('message', function echo(data) {
    socket.send(data);
  });
});

