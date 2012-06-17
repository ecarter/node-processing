
/**
 * Module dependencies.
 */

var fs = require('fs')
  , extname = require('path').extname
  , jsdom = require('jsdom')
  , express = require('express')
  , Processing = require('../')
  , app = express.createServer();

process.on('uncaughtException', function(e) {
  console.error(e);
});

app.use(express.logger('dev'));
app.use('/processing-js', express.static(__dirname + '/../deps/processing-js'));
app.use('/processing-js', express.directory(__dirname + '/../deps/processing-js'));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/test/:path(*)', function(req, res) {
  var path = req.params.path
    , file = '/../deps/processing-js/examples/' + path;
  
  fs.readFile(__dirname + file, function(err, data) {
    if ('.html' === extname(path)) {
      var canvas = Processing.document.createElement('canvas')
        , document = jsdom.jsdom(data + '')
        , window = document.createWindow()
        , script = document.getElementsByTagName('script')
        , src = script[script.length - 1].text
        , p5 = new Processing(canvas, Processing.compile(src));

      setTimeout(function() {
        p5.noLoop();
        canvas.createPNGStream().pipe(res);
      }, 500);
    } else {
      var canvas = Processing.document.createElement('canvas')
        , p5 = new Processing(canvas, Processing.compile(data + ''))
        , stream = canvas.createPNGStream();
      
      setTimeout(function() {
        p5.noLoop();
        canvas.createPNGStream().pipe(res);
      }, 500);
    }
  });
});

app.listen(3000, function() {
  console.log('listening');
});