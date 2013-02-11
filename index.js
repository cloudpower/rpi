var express = require('express'),
    five = require('johnny-five'),
    fs = require('fs'),
    remote = require('./lib/remote').create();

var arduino = new five.Board(),
    app = express(),
    online = false,
    apiUrl = 'cloudpower.drewbharris.com',
    clientId = 'myClient';

// this will be the address of the remote API server
// use localhost for testing
// attempt to connect to the remote API server
remote.on('connect', function(){
    console.log('online event');
    online = true;
});

// set up the Express static file serving
// @todo replace with nginx for this stuff
app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());

// the main web application route
app.get('/', function(req, res){
    fs.readFile(__dirname + '/static/templates/index.html', 'UTF-8', function(err, data){
        res.send(data);
    });
});

// API routes
// these will be called by the main web application

app.get('/api/v1/on', function(req, res){
    arduino.digitalWrite(13, 1); 
    console.log('turning LED on...');
    res.send('LED on');
});

app.get('/api/v1/off', function(req, res){
    arduino.digitalWrite(13, 0);
    console.log('turning LED off...');
    res.send('LED off');
});

arduino.on('ready', function(){
    remote.connectPersistent(clientId, 'ws://' + apiUrl);
    app.listen(3000);
    console.log('Listening on 3000');
    arduino.digitalWrite(13, 0);
});
