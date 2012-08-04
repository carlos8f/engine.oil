var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits

function ServerOil(opts) {
  EventEmitter.call(this);
  this.server = opts.server;
}
inherits(ServerOil, EventEmitter);
module.exports = ServerOil;

ServerOil.prototype.send = function(name, args) {
  var args = Array.prototype.slice.call(arguments), self = this;
  Object.keys(self.server.clients).forEach(function(id) {
    self.server.clients[id].oil.send.apply(self.server.clients[id].oil, args);
  });
};