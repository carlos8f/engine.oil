var BaseServer = require('engine.io').Server
  , ServerOil = require('./server.oil')
  , inherits = require('util').inherits

function Server(opts) {
  this.oil = new ServerOil({server: this});
  BaseServer.call(this, opts);
}
inherits(Server, BaseServer);
module.exports = Server;
