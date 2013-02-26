"use strict";

var when = require('when'),
	io = require('socket.io-client'),
	util = require('util'),
	events = require('events'),
	five = require('johnny-five');

var Powerbar = function(){
	this.connected = false;
	this.socket = null;
	this.connectionTimer = null;
	this.connectionInterval = 10000;

	// this will hold the states of our outlets
	this.outletStates = {
		0: 0,
                1: 1
	};

	if (process.env.NODE_ENV === 'production'){
		this.arduino = new five.Board();
		this.arduino.on('ready', function(){
			this.emit('ready');
		}.bind(this));
	}
	else {
		this.arduino = {
			'digitalWrite': function(pin, value){

				console.log('\n\t FAUXDUINO: writing ' + value + ' to pin ' + pin + '\n');
				this.outletStates[pin] = value;
			}.bind(this),
			'digitalRead': function(pin){
				console.log('value of pin ' + ' is ' + this.outletStates[pin]);
			}.bind(this)
		};
		setTimeout(function(){
			this.emit('ready');
		}.bind(this), 200);
	}
	
};
util.inherits(Powerbar, events.EventEmitter);

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
	this.socket.on('get', function(req){
		this.socket.emit('response', {
			'outlet': req.outlet,
			'state': this.outletStates[req.outlet]
		});
	}.bind(this));

	// set the state of a power outlet
	this.socket.on('set', function(req){
		this.arduino.digitalWrite(req.outlet, req.state);
		this.socket.emit('response', {
			'outlet': req.outlet,
			'state': req.state
		});
	}.bind(this));
};

function create(){
    return new Powerbar();
}

module.exports = {
    'create': create
};
