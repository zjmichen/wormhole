var socket = io.connect('http://localhost');
socket.on('message', function(data) {
  console.log(data);
});

function ready(id) {
  socket.emit('present', id);
}

function join(id) {
  socket.emit('join', id);
}

socket.on('playerJoined', function(playerid) {
  console.log('Player joined: ' + playerid);
  $('#playerlist').append('<li id="' + playerid + '">' + playerid);
});

socket.on('playerLeft', function(playerid) {
  console.log('Player left: ' + playerid);
  $('li#' + playerid).remove();
});
