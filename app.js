
/**
 * Module dependencies.
 */

var express = require('express')
  , server
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , app = express()
  , credentials = {}
  , socketio = require('socket.io')
  , socketCon = require('./controllers/SocketController')()
  , appCon = require('./controllers/ApplicationController');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
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

app.get('/', appCon.index);

server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

socketCon.init(server, credentials);