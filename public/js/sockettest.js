var socket = io.connect('http://localhost');
socket.on('message', function(data) {
  console.log(data);
});

socket.send('Test message, please ignore.');

function join(id) {
  socket.emit('join', id);
}

socket.on('playerJoined', function(playerid) {
  $('#playerlist').append('<li id="' + playerid + '">' + playerid);
});

socket.on('playerLeft', function(playerid) {
  console.log('Player left: ' + playerid);
  $('li#' + playerid).remove();
});
