var getPixels = require("get-pixels")
 


var net = require('net');
var cw = 1024
var ch = 768
var squareSize = 5
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

  getPixels("harkharkhark.png", function(err, pixels) {
    if(err) {
      console.log("Bad image path")
      return
    }
    console.log(pixels.shape)
    var iw = pixels.shape[0]
    var ih = pixels.shape[1]
    var ic = pixels.shape[2]

    setInterval(function(){

      for (var i=1; i<=ih; i++){
        for (var k=1; k<=iw; k++){
          var col = []
          var colHex = ''
          for (var o=0; o<ic; o++){
            // if (o===3) break
            col[o] = pixels.data[i*k+o]
            var hex = pixels.data[i*k+o].toString(16)
            if (hex.length === 1) hex = '0'+hex;
            colHex += hex
          }
          // console.log(colHex)
          
          var command = 'PX ' + (200 + k) + ' ' + (200 + i) + ' '+colHex+'\n';
          // console.log(command)
          client.write(command);

          // client.write('PX ' + (cw - x) + ' ' + (ch - y) + ' '+rr+rb+rg+'\n');
          // client.write('PX ' + x + ' ' + (ch - y) + ' '+rr+rb+rg+'\n');
          // client.write('PX ' + (cw - x) + ' ' + y + ' '+rr+rb+rg+'\n');

        }
      }
      // px = px + Math.round(1 - Math.random()*2)*squareSize*jumpFactor
      // py = py + Math.round(1 - Math.random()*2)*squareSize*jumpFactor
      // if (px > cw + squareSize) px = px - squareSize;
      // if (px < 0) px++;
      // if (py > ch + squareSize) py = py - squareSize;
      // if (py < 0) py++;
      // // console.log(command)
    }, 0.01)

    // console.log("got pixels", pixels.shape.slice())
    // console.log("got pixels", pixels)
  })

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




