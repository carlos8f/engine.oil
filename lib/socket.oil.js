var EventEmitter = require('events').EventEmitter
  , hydration = require('hydration')
  , inherits = require('util').inherits
  , isArray = require('util').isArray

function SocketOil(opts) {
  EventEmitter.call(this);
  this.server = opts.server;
  this.socket = opts.socket;
  this.socket.on('message', this.onMessage.bind(this));
}
inherits(SocketOil, EventEmitter);
module.exports = SocketOil;

SocketOil.prototype.onMessage = function(msg) {
  var self = this;
  try {
    var unpacked = hydration.hydrate(JSON.parse(msg));
    if (unpacked.ev) {
      if (unpacked.ack) {
        unpacked.args.push(function() {
          self.send.apply(self, [unpacked.ack].concat(Array.prototype.slice.call(arguments)));
        });
      }
      this.emit.apply(this, [unpacked.ev].concat(unpacked.args));
    }
  }
  catch (e) {};
};

SocketOil.prototype.send = function(ev, args) {
  try {
    if (isArray(ev)) {
      args = ev;
      ev = args.shift();
    }
    else {
      args = Array.prototype.slice.call(arguments, 1);
    }
    this.socket.send(JSON.stringify(hydration.dehydrate({ev: ev, args: args})));
  }
  catch (e) {
    console.error(e, 'error sending socket');
  };
};

SocketOil.prototype.broadcast = function(ev, args) {
  var self = this;
  Object.keys(this.server.clients).forEach(function(id) {
    // Don't broadcast to self
    if (id === self.socket.id) return;
    self.server.clients[id].oil.send.apply(self.server.clients[id].oil, Array.prototype.slice.call(arguments));
  });
};

SocketOil.prototype.join = function(room) {
  this.server.oil.join(room, this.socket);
};

SocketOil.prototype.leave = function(room) {
  this.server.oil.leave(room, this.socket);
};

SocketOil.prototype.in = function(room) {
  var thisArg = {
    server: {
      clients: this.server.oil.room(room)
    },
    socket: this.socket
  };
  return {
    broadcast: SocketOil.prototype.broadcast.bind(thisArg)
  };
};