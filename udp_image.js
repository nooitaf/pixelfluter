


var Canvas = require('canvas')
var fs = require('fs')
var Image = Canvas.Image
var net = require('net')


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

var cw = 80
var ch = 80
var moveDistance = 100
var forceAlpha = 40
var colorRandomFactor = 30
var colorCap = 120
var trollCount = 100

xoffset = 0
yoffset = 0

var xo = 0
var yo = 0

hr = 0
hg = 0
hb = 0

canvas = new Canvas(cw, ch)
ctx = canvas.getContext('2d')

var imageFiles = ['troll.png','forever.jpg','image.jpg','hark.jpg','harkdark.jpg','nyancat.png']
getFile = function(){
    var imgFileName = process.argv[2] || imageFiles[Math.floor(Math.random()*imageFiles.length)]
    console.log(imgFileName)
    fs.readFile(__dirname + '/' + imgFileName, function(err, squid) {
        if (err) throw err;
        img = new Image;
        img.src = squid;
        ctx.drawImage(img, 0, 0, xoffset + img.width, yoffset + img.height, 0, 0, cw, ch);
    });
}
getFile()

// Create a new client instance
var client = PixelVloedClient;

function RandomFill(width, height){
  var msg = NewMessage(1)
  var imgd = ctx.getImageData(0, 0, cw, ch);
  var pix = imgd.data;

  var row = 0
  var col = 0
  var bufferCount = 0

  for (var i = 0, n = pix.length; i < n; i += 4) {
      var r = pix[i]
      var g = pix[i + 1]
      var b = pix[i + 2]
      var a = pix[i + 3]

      if (r>colorCap) r = hr
      if (g>colorCap) g = hg
      if (b>colorCap) b = hb

      if (!trollCount) {
        r = 255
        g = 255
        b = 255
        a = a
      } else {
        if (a > forceAlpha) a = forceAlpha  
      }


      var x = col+xo;
      var y = row+yo;

      // console.log(xo,yo)
      // console.log(r,g,b,a)
      if (x>=0&&y>=0) {
        RGBPixel(msg,bufferCount*8+2,x,y,r,g,b,a)
        bufferCount++
      }

      col++
      if (col >= cw) {
          col = 0
          row++
      }
      if (row >= ch) {
          hr = hr + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
          if (hr >= 256) hr = 255;
          if (hr < 0)   hr = 0;

          hg = hg + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
          if (hg >= 255) hg = 255
          if (hg < 0)   hg = 0

          hb = hb + Math.round(colorRandomFactor-Math.random()*(colorRandomFactor*2))
          if (hb >= 255) hb = 255
          if (hb < 0)   hb = 0

          trollCount++
          if (trollCount > 200) {
            trollCount = 0
          }

          // console.log('klaar')
          xo += Math.random()*moveDistance*(Math.random()*2-1)
          yo += Math.random()*moveDistance*(Math.random()*2-1)
          // xo++
          // yo++

          if (xo > width  - cw || xo < -cw) xo = 0 - cw
          if (yo > height - ch || yo < -ch) yo = 0 - ch
          // console.log(xo,yo)
      }
      if (bufferCount > 100 || i == pix.length) {
        // console.log(msg.length)
        // client.SendPacket(msg,1)
        client.sock.send(msg,0,msg.length,5005,'100.123.2.173')
        msg = NewMessage(1)
        // console.log(msg.length)
        // console.log('reset', bufferCount)
        bufferCount = 0
      }
  }

  return msg;
}




// bind the effect
client.effect = function(err, bytes){
  if (err) throw err;
  var msg = RandomFill(client.width, client.height);
  client.SendPacket(msg);
}
// Init the clients autodetection
// (firstserver, debug,ip, port, width, height, effect, alpha)
client.init(null,null,'100.123.2.173',5005,1366,786,null,100);

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



