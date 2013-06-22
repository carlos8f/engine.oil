var BaseServer = require('../').BaseServer
  , transports = require('engine.io').transports
  , Socket = require('../').Socket
  , ServerOil = require('./server.oil')
  , inherits = require('util').inherits

function Server(opts) {
  this.oil = new ServerOil({server: this});
  BaseServer.call(this, opts);
}
inherits(Server, BaseServer);
module.exports = Server;

/**
 * Handshakes a new client.
 *
 * @param {String} transport name
 * @param {Object} request object
 * @api private
 */

Server.prototype.handshake = function (transport, req) {
  var id = this.id();

  var transport = new transports[transport](req)
    , socket = new Socket(id, this, transport)
    , self = this

  if (false !== this.cookie) {
    transport.on('headers', function (headers) {
      headers['Set-Cookie'] = self.cookie + '=' + id;
    });
  }

  transport.onRequest(req);

  this.clients[id] = socket;
  this.clientsCount++;
  this.emit('connection', socket);

  socket.once('close', function () {
    delete self.clients[id];
    self.clientsCount--;
  });
};
