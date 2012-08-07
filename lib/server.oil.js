var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits

function ServerOil(opts) {
  EventEmitter.call(this);
  this.server = opts.server;
  this.rooms = {};
}
inherits(ServerOil, EventEmitter);
module.exports = ServerOil;

ServerOil.prototype.send = function(name, args) {
  var args = Array.prototype.slice.call(arguments), self = this;
  Object.keys(self.server.clients).forEach(function(id) {
    self.server.clients[id].oil.send.apply(self.server.clients[id].oil, args);
  });
};

ServerOil.prototype.room = function(room) {
  return this.rooms[room] || {};
};

ServerOil.prototype.in = function(room) {
  var clients = this.room(room);
  var thisArg = {
    server: {
      clients: clients
    }
  };
  return {
    send: ServerOil.prototype.send.bind(thisArg)
  };
};

ServerOil.prototype.join = function(room, socket) {
  var self = this;
  socket.on('close', function() {
    socket.leave(room);
  });
  this.rooms[room] || (this.rooms[room] = {});
  this.rooms[room][socket.id] = socket;
};

ServerOil.prototype.leave = function(room, socket) {
  if (this.rooms[room]) {
    delete this.rooms[room][socket.id];
  }
};