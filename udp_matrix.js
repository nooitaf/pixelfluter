
// Install nodejs nodejs-legacy
// Install npm
// with npm install jspack
// with npm install sleep

// imports
var dgram = require('dgram');
var struct = require('jspack')['jspack'];
var sleep = require('sleep');

// static vars
var PROTOCOL_PREAMBLE = 'pixelvloed';
var DISCOVER_PORT = 5006;
var MAX_PROTOCOL_VERSION = 1;
var MAX_PIXELS = 140;
var UDP_PORT =  5005;

PixelVloedClient = {
  /*Sets up a client
  Arguments:
    firstserver: (bool) False, select the first server immediately
    debug: (bool) False
    ip: (str) None
    port: (int) None
    width: (int) 640
    height: (int) 480
  Listens for servers if no ip is given
  */
  discoverysock: null,
  sock: null,
  sleep: 100,
  debug: true,
  width: 640,
  height: 480,
  effect: null,
  alpha: false,

  init: function(firstserver, debug,
                 ip, port,
                 width, height,
                 effect, alpha){

    if(debug){ this.debug = debug; }
    if(effect){ this.effect = effect; }
    if(alpha){ this.alpha = alpha; }
    
    if (ip){
      this.ipaddress = ip;
      this.port = (port?port:UDP_PORT);
      this.width = width;
      this.height = height;
      this.start();
    } else {
      this.DiscoverServers(firstserver)
    }
  },

  start: function(){
    this.sock = dgram.createSocket('udp4');
    if (this.debug){
      console.log('displaying on '+this.ipaddress+':'+this.port+', '+this.width+'*'+this.height+'px');
    }
    this.effect();
  },
  
  Sleep: function(duration){
    // Sleeps the designated amount of time
    sleep.usleep((duration?duration:this.sleep) * 1000);
  },
  
  SendPacket: function(message, delay){
    /*Sends the message to the udp server
    Arguments:
      message: (str, 140)
      sleep:  (bool) True, should the client sleep for a while?
    */
    this.sock.send(message, 0, message.length, 
        this.port, this.ipaddress, 
        this.effect.bind(this));
    if (delay){
      sleep.usleep(this.sleep);    
    }
  },
 
  DiscoverServers: function (){
      //Discover servers that send out the pixelvloed preample
      this.discoverysock = dgram.createSocket("udp4");
      this.discoverysock.on("message", this.handleDiscoveryPacket.bind(this));

      this.discoverysock.on('error', function (err) {
        console.error(err);
        process.exit(0);
      });
      this.discoverysock.bind(DISCOVER_PORT);
  },
  
  handleDiscoveryPacket: function (data, rinfo) {
    data = String(data);
    console.log("server got: " + typeof String(data) + " from " + rinfo.address + ":" + rinfo.port);
    if (data.startsWith(PROTOCOL_PREAMBLE)){
      var dataset = data.split(' ');
      if (dataset[0].split(':')[1] <= MAX_PROTOCOL_VERSION){
        this.ipaddress = dataset[1].split(':')[0];
        this.port =  parseInt(dataset[1].split(':')[1], 10);
        this.width = parseInt(dataset[2].split('*')[0], 10);
        this.height = parseInt(dataset[2].split('*')[1], 10);
        this.discoverysock.close();
        this.start();
      }
    }
  } 
};

function NewMessage(alpha){
  // Creates a new message with the correct max size, rgb mode and version
  var message = new Buffer((MAX_PIXELS*(alpha?8:7))+2);
  message.fill(0);
  //MaxSizeList(+2);
  message[0] = SetRGBAMode(alpha);
  message[1] = SetVersionBit(1);
  return message;
}

function RGBPixel(message, offset, x, y, r, g, b, a){
  // Generates the packed data for a pixel
  message.writeUInt16LE(x, offset);
  message.writeUInt16LE(y, offset+2);
  message.writeUInt8(r, offset+4);
  message.writeUInt8(g, offset+5);
  message.writeUInt8(b, offset+6);
  if (a){
    message.writeUInt8(a, offset+7);
  }
}

function SetRGBAMode(mode){
  // Generate the rgb/rgba bit
  return struct.Pack("<B", [mode]);
}

function SetVersionBit(protocol){
  // Generate the Version bit
  return struct.Pack("<B", [protocol]);
}

var cw = 1366
var ch = 786
var squareSize = 10

var px = 0
var py = 0

hr = 0
hg = 0
hb = 0

var colorRandomFactor = 1
var jumpFactor = 1

function RandomFill(width, height){
  var msg = NewMessage(1);

  var bufferCount = 0

  hr = hr + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
  if (hr >= 256) hr = 255;
  if (hr < 0)   hr = 0;
  var rr = hr

  hg = hg + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
  if (hg >= 255) hg = 255
  if (hg < 0)   hg = 0
  var rg = hg

  hb = hb + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
  if (hb >= 255) hb = 255
  if (hb < 0)   hb = 0
  var rb = hb
  
  // rr=255
  // rg=255
  // rb=255
  rr=0
  rg=0
  rb=0

  for (var j=0; j<= squareSize; j++){
    for (var k=0; k<= squareSize; k++){
      var x = Math.round(px+j)
      var y = Math.round(py+k)
      RGBPixel(msg,bufferCount*8+2,x,y,rr,rg,rb,55)
      bufferCount++
    }
  }
  px = px + Math.round(1 - Math.random()*2)*squareSize*jumpFactor
  py = py + Math.round(1 - Math.random()*2)*squareSize*jumpFactor
  if (px > cw + squareSize) px = px - squareSize;
  if (px < 0) px = 0;
  if (py > ch + squareSize) py = py - squareSize;
  if (py < 0) py = 0;

  // PixelVloedClient.Sleep(0.1);
  return msg;
}







// Create a new client instance
var client = PixelVloedClient;


// canvas 
var canvasWidth = 64/1 // width
var canvasHeight = 32/1 // height

var blockWidth = 1366/64
var blockHeight = 786/32

function randomChar() {
    //33 - 126
    var startChar = 36
    var endChar = 126
    var dist = Math.floor(Math.random() * (endChar-startChar))
    return String.fromCharCode(startChar + dist)
}

var heads = []
var tails = []
for (var i = 0; i < canvasWidth; i++) {
    if (!heads[i]) heads[i] = Math.floor(Math.random() * canvasHeight)
    if (!tails[i]) tails[i] = Math.floor(Math.random() * canvasHeight*2)
}


var _msg = null
var _pixelcount = 0


function PushSquare(x,y,w,h,r,g,b,a){
    for (var i=0; i < w; i++){
        for (var j=0; j < h; j++){
            PushPixel(i+x,j+y,r,g,b,a)
        }
    }
}


function PushPixel(x,y,r,g,b,a){
    if (!_msg) _msg = NewMessage(1)

    // console.log('push pixel',x,y,r,g,b,a)
    // Generates the packed data for a pixel
    var offset = _pixelcount*8+2

    _msg.writeUInt16LE(x, offset);
    _msg.writeUInt16LE(y, offset+2);
    _msg.writeUInt8(r, offset+4);
    _msg.writeUInt8(g, offset+5);
    _msg.writeUInt8(b, offset+6);
    _msg.writeUInt8(a, offset+7);

    _pixelcount++
    if (_pixelcount > 20 ) {
        PushPackage()
    }
}

function PushPackage(){
    // console.log('push package',_msg)

    client.sock.send(_msg,0,_msg.length,5005,'100.123.2.173')
    _msg = NewMessage(1)
    // console.log('Push{ackage', _pixelcount)
    _pixelcount = 0
}


RenderLoop = function(width,height) {
    console.log('renderLoop')
    // draw square
    for (var i = 0; i < canvasWidth; i++) {
        heads[i]++
        if (heads[i]>canvasHeight*2) {
            heads[i] = -Math.floor(Math.random()*20)
            tails[i] = Math.floor(Math.random() * canvasHeight)+3
        }

    }
    var x = 0
    var y = 0
    // var colorHead_ = "AAFFAA";
    var colorHead = { r: 190, g: 255, b: 190, a: 255 }
    // var colorTail_ = "009900";
    var colorTail = { r: 0, g: 170, b: 0, a: 255 }
    // var colorTailDark = "005500"
    var colorTailDark = { r: 0, g: 90, b: 0, a: 255 }
    for (var row = 0; row < canvasHeight; row++) {
        for (var col = 0; col < canvasWidth; col++) {
            x = col
            y = row

            // var changingTailColor = col % 2 ? colorTail : colorTailDark;
            var changingTailColor = colorTail;

            // background only
            // if (y === heads[col])                   PushPixel(x,y,colorHead.r,colorHead.g,colorHead.b,colorHead.a)
            if (y === heads[col])                   PushSquare(x*blockWidth,y*blockHeight,blockWidth,blockHeight,colorHead.r,colorHead.g,colorHead.b,colorHead.a)
            if (y === heads[col] -1)                PushSquare(x*blockWidth,y*blockHeight,blockWidth,blockHeight,colorTail.r,colorTail.g,colorTail.b,colorTail.a)
            if (y === heads[col] - tails[col] -1 )  PushSquare(x*blockWidth,y*blockHeight,blockWidth,blockHeight,0,0,0,255)
            // text only
            // if (y === heads[col]) client.write('TX ' + x + ' ' + y + ' ' + randomChar() + ' ' + colorHead + '\n');
            // if (y === heads[col] -1) client.write('TX ' + x + ' ' + y + '  ' + changingTailColor + '\n');
            // if (y === heads[col] - tails[col] -1 ) client.write('TX ' + x + ' ' + y + ' false\n');


        }
    }
    return NewMessage(1)
}














// bind the effect
client.effect = function(err, bytes){
  if (err) throw err;
  var msg = RenderLoop(client.width, client.height);
  client.SendPacket(msg);
}
// Init the clients autodetection
// (firstserver, debug,ip, port, width, height, effect, alpha)
client.init(null,null,'100.123.2.173',5005,1366,786,null,100);

var cw = 1366
var ch = 786
// helpers
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// polyfills
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}





