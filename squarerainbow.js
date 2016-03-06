

var net = require('net');
var cw = 1024
var ch = 768
var squareSize = 15
var colorRandomFactor = 30
var jumpFactor = 1.2


var client = new net.Socket();
client.connect(1234, '100.123.2.16', function() {
  console.log('Connected');
  px = parseInt(Math.random()*cw)
  py = parseInt(Math.random()*ch)
  hr = 0
  hg = 0
  hb = 0
  setInterval(function(){
    hr = hr + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
    if (hr >= 256) hr = 255;
    if (hr < 0)   hr = 0;
    var rr = hr.toString(16)
    if (rr.length === 1) rr = '0'+rr;

    hg = hg + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
    if (hg >= 255) hg = 255
    if (hg < 0)   hg = 0
    var rg = hg.toString(16)
    if (rg.length === 1) rg = '0'+rg;

    hb = hb + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
    if (hb >= 255) hb = 255
    if (hb < 0)   hb = 0
    var rb = hb.toString(16)
    if (rb.length === 1) rb = '0'+rb;

    for (var i=0; i<= squareSize; i++){
      for (var k=0; k<= squareSize; k++){
        var x = Math.round(px+i)
        var y = Math.round(py+k)
        var command = 'PX ' + x + ' ' + y + ' '+rr+rb+rg+'\n';
        // console.log(command)
        client.write(command);

        client.write('PX ' + (cw - x) + ' ' + (ch - y) + ' '+rr+rb+rg+'\n');
        client.write('PX ' + x + ' ' + (ch - y) + ' '+rr+rb+rg+'\n');
        client.write('PX ' + (cw - x) + ' ' + y + ' '+rr+rb+rg+'\n');

      }
    }
    px = px + Math.round(1 - Math.random()*2)*squareSize*jumpFactor
    py = py + Math.round(1 - Math.random()*2)*squareSize*jumpFactor
    if (px > cw + squareSize) px = px - squareSize;
    if (px < 0) px++;
    if (py > ch + squareSize) py = py - squareSize;
    if (py < 0) py++;
    // console.log(command)
  }, 0.001)
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});

client.on('error', function(err) {
   console.log(err)
   client.destroy(); // kill client after server's response
})
client.on('close', function() {
  console.log('Connection closed');
});