var when = require('when'),
	io = require('socket.io-client'),
	util = require('util'),
	events = require('events');

var Remote = function(){
	this.connected = false;
	this.socket = null;
}
util.inherits(Remote, events.EventEmitter);

Remote.prototype.connect = function(address){
	this.socket = io.connect(address);
	this.socket.on('connect', function(){
		this.emit('connect');
	}.bind(this));
}

function create(){
    return new Remote();
}

module.exports = {
    'create': create
}