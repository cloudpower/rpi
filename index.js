var express = require('express'),
    five = require('johnny-five'),
    fs = require('fs');

var board = new five.Board();
var app = express();

app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());

app.get('/', function(req, res){
    fs.readFile(__dirname + '/static/templates/index.html', 'UTF-8', function(err, data){
        res.send(data);
    });
});

// API Routes

app.get('/api/v1/on', function(req, res){
    board.digitalWrite(13, 1); 
    console.log('turning LED on...');
    res.send('LED on');
});

app.get('/api/v1/off', function(req, res){
    board.digitalWrite(13, 0);
    console.log('turning LED off...');
    res.send('LED off');
});

board.on('ready', function(){
    app.listen(3000);
    console.log('Listening on 3000');
    board.digitalWrite(13, 0);
});
