var Sockman = (function(Sockman) {
  var socket = io.connect('http://localhost');

  socket.on('message', function(data) {
    console.log(data);
  });

  Sockman.ready = function(id) {
    socket.emit('present', id);
  };

  Sockman.join = function(id) {
    socket.emit('join', id);
    $('#join').remove();

    $('canvas#wormhole').fadeIn();
    Game.init('wormhole');
    Game.start();
  };

  socket.on('playerJoined', function(playerid) {
    console.log('Player joined: ' + playerid);
    $('#playerlist').append('<li id="' + playerid + '">' + playerid);
  });

  socket.on('playerLeft', function(playerid) {
    console.log('Player left: ' + playerid);
    $('li#' + playerid).remove();
  });

  return Sockman;

})({});
