var when = require('when'),
	io = require('socket.io-client'),
	util = require('util'),
	events = require('events'),
	five = require('johnny-five');

var Powerbar = function(){
	this.connected = false;
	this.socket = null;
	this.connectionTimer = null;
	this.arduino = new five.Board();
	this.arduino.on('ready', function(){
		this.emit('ready');
	}.bind(this));

	// this will hold the states of our outlets
	this.outletStates = {
		0: 0
	}
}
util.inherits(Powerbar, events.EventEmitter);

Powerbar.prototype.connectPersistent = function(deviceId, address){
	this.socket = io.connect(address);
	// try to connect once a minute
	this.connectionTimer = setInterval(function(){
		if (!this.socket.socket.connected){
			this.socket = io.connect(address);
		}
	}.bind(this), 60000);
	this.socket.on('connect', function(){
		if (this.connectionTimer !== null){
			clearInterval(this.connectionTimer);
		}
		this.socket.emit('device-id', deviceId);
		this.emit('remote-connect');
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
		this.arduino.digitalWrite(req.outlet, req.state)
		this.socket.emit('response', {
			'outlet': req.outlet,
			'state': req.state
		});
	}.bind(this));
}

function create(){
    return new Powerbar();
}

module.exports = {
    'create': create
}