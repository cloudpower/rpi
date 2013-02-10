var when = require('when'),
	socket = require('socket.io-client'),
	util = require('util'),
	events = require('events');

var Remote = function(){
	this.connected = false;
	this.io = null;
}
util.inherits(Remote, events.EventEmitter);

Remote.prototype.connect = function(address){
	this.io = socket.connect(address);
	this.io.on('connect', function(){
		this.emit('connect');
	}.bind(this));
}

function create(){
    return new Remote();
}

module.exports = {
    'create': create
}