var EventEmitter = require('events').EventEmitter
  , hydration = require('hydration')
  , inherits = require('util').inherits
  , isArray = require('util').isArray

function SocketOil(opts) {
  EventEmitter.call(this);
  var self = this;
  this.server = opts.server;
  this.socket = opts.socket;
  this.rooms = [];
  this.socket.on('message', this.onMessage.bind(this));
  this.socket.once('close', function () {
    self.rooms.map(self.leave.bind(self));
  });
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
          self.send([unpacked.ack].concat(Array.prototype.slice.call(arguments)));
        });
      }
      this.emit.apply(this, [unpacked.ev].concat(unpacked.args));
    }
  }
  catch (e) {
    console.error(e, 'error SocketOil.onMessage()');
    console.error(e.stack, 'stack');
  };
};

SocketOil.prototype.send = function() {
  var args = isArray(arguments[0]) ? arguments[0] : arguments
    , argsCopy = Array.prototype.slice.call(args)
    , ev = argsCopy.shift()

  try {
    this.socket.send(JSON.stringify(hydration.dehydrate({ev: ev, args: argsCopy})));
  }
  catch (e) {
    console.error(e, 'error SocketOil.send()');
    console.error(e.stack, 'stack');
  };
};


SocketOil.prototype.to = function(id) {
  var self = this, args = arguments;
  self.server.clients[id].oil.send.apply(self.server.clients[id].oil, args);
};

SocketOil.prototype.broadcast = function() {
  var self = this, args = arguments;

  Object.keys(this.server.clients).forEach(function(id) {
    // Don't broadcast to self
    if (id === self.socket.id) return;
    self.server.clients[id].oil.send.apply(self.server.clients[id].oil, args);
  });
};

SocketOil.prototype.join = function(room) {
  var self = this;
  if (this.rooms.indexOf(room) === -1) {
    this.server.oil.join(room, this.socket);
    this.rooms.push(room);
  }
};

SocketOil.prototype.leave = function(room) {
  var idx = this.rooms.indexOf(room);
  if (idx !== -1) {
    this.server.oil.leave(room, this.socket);
    this.rooms.splice(idx, 1);
  }
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
