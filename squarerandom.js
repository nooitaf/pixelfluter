
var net = require('net');
var cw = 1024
var ch = 768
var squareSize = 10



var client = new net.Socket();
client.connect(1234, '100.123.2.16', function() {
  console.log('Connected');
  setInterval(function(){
    var px = parseInt(Math.random()*cw)
    var py = parseInt(Math.random()*ch)
    for (var i=0; i<= squareSize; i++){
      for (var k=0; k<= squareSize; k++){
        var command = 'PX ' + Math.round(px+i) + ' ' + Math.round(py+k) + ' 000000\n';
        client.write(command);
      }
    }

  }, 10)
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});

client.on('error', function(err) {
   console.log(err)
})
client.on('close', function() {
  console.log('Connection closed');
});