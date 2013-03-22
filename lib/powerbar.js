"use strict";

var when = require('when'),
    io = require('socket.io-client'),
    util = require('util'),
    events = require('events'),
    SerialPort = require('serialport').SerialPort;

var Powerbar = function(){
    this.connected = false;
    this.socket = null;
    this.connectionTimer = null;
    this.connectionInterval = 10000;
    this.portname = "/dev/serialport";
    // this will hold the states of our outlets
    this.outletStates = {
        0: 0,
        1: 0,
        2: 0,
        3: 0
    };
    if (process.env.NODE_ENV === 'production'){
        this.arduino = new SerialPort(this.portname, {
            baudRate: 115200,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
        });
        this.arduino.on('open', function(){
            this.emit('ready');
        }.bind(this));
    }
    else {
        setTimeout(function(){
            this.emit('ready');
        }.bind(this), 200);
    }
};
util.inherits(Powerbar, events.EventEmitter);

Powerbar.prototype.requestUsageValues = function(){
    var d = when.defer();
    this.arduino.write("report\n");
    this.arduino.on('data', function(data) {
        console.log('data received: ' + data);
        // may have to strip off newline char before parsing
        return d.resolve(JSON.parse(data));
    });
    return d.promise;
};

Powerbar.prototype.setOutletState = function(outlet, state){
    var d = when.defer();
    this.outletStates[outlet] = state;
    this.arduino.write("set " + outlet + ":" + state + "\n");
    this.arduino.on('data', function(data){
        if (JSON.parse(data).success){
            return d.resolve();
        }
        return d.reject(JSON.parse(data).message);
    });
    return d.promise;
};

Powerbar.prototype.getOutletState = function(outlet){
    return this.outletStates[outlet];
};

Powerbar.prototype.setLedState = function(led, state){
    var d = when.defer();
    this.arduino.write("led " + led + ":" + state + "\n");
    this.arduino.on('data', function(data){
        if (JSON.parse(data).success){
            return d.resolve();
        }
        return d.reject(JSON.parse(data).message);
    });
    return d.promise;
};

Powerbar.prototype.connectPersistent = function(deviceId, address){
    this.socket = io.connect(address);
    console.log('attempting connection to remote server...');
    // try to connect once a [interval]
    this.connectionTimer = setInterval(function(){
        if (!this.socket.socket.connected){
            console.log('attempting connection to remote server...');
            this.socket = io.connect(address);
        }
    }.bind(this), this.connectionInterval);
    this.socket.on('connect', function(){
        if (this.connectionTimer !== null){
            clearInterval(this.connectionTimer);
        }
        this.socket.emit('device-id', deviceId);
        this.emit('remote-connect');
        console.log('successfully connected to remote server.');
    }.bind(this));

    // get the current state of a power outlet
    this.socket.on('getState', function(req){
        this.socket.emit('response', {
            'outlet': req.outlet,
            'state': this.getOutletState(req.outlet)
        });
    }.bind(this));

    // set the state of a power outlet
    this.socket.on('setState', function(req){
        this.setOutletState(req.outlet, req.state).then(function(){
            this.socket.emit('response', {
                'outlet': req.outlet,
                'state': req.state
            });
        }, function(err){
            this.socket.emit('response', {
                'error': err
            });
        });
    }.bind(this));

    // request the current usage values from the arduino
    this.socket.on('getUsageValues', function(req){
        this.getUsageValues().then(function(values){
            this.socket.emit('response', {
                'values': values
            });
        });
    });
};

function create(){
    return new Powerbar();
}

module.exports = {
    'create': create
};
