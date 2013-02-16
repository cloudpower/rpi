"use strict";

var express = require('express'),
    five = require('johnny-five'),
    fs = require('fs'),
    pb = require('./lib/powerbar'),
    dirty = require('dirty'),
    config = dirty('config.db');

var app = express(),
    online = false,
    apiUrl = 'cloudpower.drewbharris.com',
    deviceId = 'myDevice',
    powerbar,
    deviceId;

// set up the Express static file serving
// @todo replace with nginx for this stuff
app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());

// load the config for this device


// the main web application route
app.get('/', function(req, res){
    fs.readFile(__dirname + '/static/templates/index.html', 'UTF-8', function(err, data){
        res.send(data);
    });
});

// API routes
// these will be called by the main web application

app.get('/api/v1/on', function(req, res){
    powerbar.arduino.digitalWrite(13, 1);
    console.log('turning LED on...');
    res.send('LED on');
});

app.get('/api/v1/off', function(req, res){
    powerbar.arduino.digitalWrite(13, 0);
    console.log('turning LED off...');
    res.send('LED off');
});

config.on('load', function(){

    // assign the device id if it exists
    // otherwise we we need to set this up
    // as a new device
    deviceId = config.get('device_id');
    if (deviceId === undefined){
        // wait for QR decoding
        console.log('stuff');
    }

    powerbar = pb.create();

    // this will be the address of the remote API server
    // use localhost for testing
    // attempt to connect to the remote API server
    powerbar.on('remote-connect', function(){
        console.log('online event');
        online = true;
    });

    powerbar.on('ready', function(){
        powerbar.connectPersistent(deviceId, 'ws://' + apiUrl);
        app.listen(3000);
        console.log('Listening on 3000');
        powerbar.arduino.digitalWrite(13, 0);
    });
});



