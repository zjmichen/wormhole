var socket = io.connect('http://localhost');
socket.on('message', function(data) {
  console.log(data);
});

socket.send('Test message, please ignore.');

function join(id) {
  socket.emit('join', id);
}
