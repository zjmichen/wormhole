var Sockman = (function(Sockman) {
  var socket = io.connect(window.location.origin);

  socket.on('message', function(data) {
    console.log(data);
  });

  Sockman.ready = function(gameid) {
    socket.emit('present', gameid);
  };

  Sockman.join = function(gameid) {
    socket.emit('join', gameid);
    $('#join').remove();
    requestFullscreen(document.querySelector('#wormhole'));
  };

  Sockman.send = function(data, playerid) {
    socket.emit('wormhole', {
      to: playerid,
      data: data
    });
  };

  socket.on('playerJoined', function(playerid) {
    console.log('Player joined: ' + playerid);
    $('#playerlist').append('<li id="' + playerid + '">' + playerid);

    if (Game.playing) {
      Game.addPlayer(playerid);
    }
  });

  socket.on('playerLeft', function(playerid) {
    console.log('Player left: ' + playerid);
    $('li#' + playerid).remove();

    if (Game.playing) {
      Game.removePlayer(playerid);
    }
  });

  socket.on('startGame', function() {
    $('canvas#wormhole').fadeIn();
    Game.init('wormhole');

    socket.emit('getPlayers');

    socket.on('playerList', function(players) {
      players.forEach(function(playerid) {
        if (playerid !== socket.socket.sessionid) {
          Game.addPlayer(playerid);
        }
      });
    });

    Game.start();
  });

  socket.on('wormhole', function(msg) {
    Game.receiveObject(msg.data, msg.from);
  });

  return Sockman;

})({});

function requestFullscreen(elem) {
  if (elem.requestFullscreen) {
      elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
  }
}
