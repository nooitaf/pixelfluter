var net = require('net');
var cw = 1024
var ch = 768

var client = new net.Socket();
client.connect(1234, '100.123.2.16', function() {
  console.log('Connected');
  for (var i=0; i<= cw; i++){
    for (var k=0; k<= ch; k++){
      var rr = Math.floor(Math.random()*256).toString(16)
      if (rr.length === 1) rr = '0'+rr;
      var rg = Math.floor(Math.random()*256).toString(16)
      if (rg.length === 1) rg = '0'+rg;
      var rb = Math.floor(Math.random()*256).toString(16)
      if (rb.length === 1) rb = '0'+rb;
      var command = 'PX ' + i + ' ' + k + ' '+ rr + rg + rb +'\n';
      console.log(command);
      client.write(command);
    }
  }
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