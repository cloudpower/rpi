var express = require('express'),
    five = require('johnny-five');

var board = new five.Board();
var app = express();

app.get('/', function(request, response){
    response.send('hello world');
});

board.on('ready', function(){
    app.listen(3000);
    console.log('Listening on 3000');
    var ledPin = new five.Led(13);
    ledPin.strobe();
});
