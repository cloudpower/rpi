var when = require('when'),
	io = require('socket.io-client'),
	util = require('util'),
	events = require('events');

var Remote = function(){
	this.connected = false;
	this.socket = null;
	this.connectionTimer = null;
}
util.inherits(Remote, events.EventEmitter);

Remote.prototype.connectPersistent = function(deviceId, address){
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
		this.emit('connect');
	}.bind(this));

	this.socket.on('get', function(req){
		this.socket.emit('response', {
			'port': req.port,
			'state': 0
		});
	}.bind(this));
}

function create(){
    return new Remote();
}

module.exports = {
    'create': create
}