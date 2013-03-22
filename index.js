"use strict";

var express = require('express'),
    fs = require('fs'),
    pb = require('./lib/powerbar'),
    dirty = require('dirty'),
    config = dirty('config.db');

var app = express(),
    online = false,
    apiUrl = 'cloudpower.drewbharris.com',
    deviceId = 'myDevice',
    serialPort = '/dev/tty.usbserial-A600afh6',
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

// Test API routes
//

// set state
app.get('/api/v1/outlet/:outlet/:state', function(req, res){
    var outlet = parseInt(req.params.outlet, 10),
        state = parseInt(req.params.state, 10);
    powerbar.setOutletState(outlet, state);
    powerbar.outletStates[outlet] = state;
    console.log('setting state of ' + outlet + ' to ' + state);
    res.send({
        'outlet': outlet,
        'state': state
    });
});

// get state
app.get('/api/v1/outlet/:outlet', function(req, res){
    var outlet = parseInt(req.params.outlet, 10),
        state = powerbar.getOutletState(outlet);
    res.send({
        'outlet': outlet,
        'state': state
    });
});

// get usage values
app.get('/api/v1/usage', function(req, res){
    powerbar.getUsageValues().then(function(values){
        res.send(values);
    }, function(err){
        res.send(err);
    });
});

config.on('load', function(){

    // assign the device id if it exists
    // otherwise we we need to set this up
    // as a new device
    deviceId = config.get('device_id');
    if (deviceId === undefined){
        deviceId = 'device-0';
        // wait for QR decoding
    }
    console.log('device id: ' + deviceId);
    powerbar = pb.create(serialPort);

    // this will be the address of the remote API server
    // use localhost for testing
    // attempt to connect to the remote API server
    powerbar.on('remote-connect', function(){
        online = true;
    });

    powerbar.on('ready', function(){
        powerbar.connectPersistent(deviceId, 'ws://' + apiUrl);
        app.listen(3000);
        console.log('Listening on 3000');
    });
});
