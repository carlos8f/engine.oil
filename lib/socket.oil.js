var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits

function SocketOil(opts) {
  EventEmitter.call(this);
  this.server = opts.server;
  this.socket = opts.socket;
  this.socket.on('message', this.onMessage.bind(this));
}
inherits(SocketOil, EventEmitter);
module.exports = SocketOil;

SocketOil.prototype.onMessage = function(msg) {
  try {
    var unpacked = JSON.parse(msg);
    if (unpacked.ev) {
      this.emit.apply(this, [unpacked.ev].concat(unpacked.args));
    }
  }
  catch (e) {};
};

SocketOil.prototype.send = function(ev, args) {
  try {
    this.socket.send(JSON.stringify({ev: ev, args: Array.prototype.slice.call(arguments, 1)}));
  }
  catch (e) {};
};

SocketOil.prototype.broadcast = function(ev, args) {
  args = Array.prototype.slice.call(arguments);
  var self = this;
  Object.keys(this.server.clients).forEach(function(id) {
    // Don't broadcast to self
    if (id === self.socket.id) return;
    self.server.clients[id].oil.send.apply(self.server.clients[id].oil, args);
  });
};
