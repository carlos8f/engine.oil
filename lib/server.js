var BaseServer = require('../').BaseServer
  , transports = require('engine.io').transports
  , Socket = require('../').Socket
  , ServerOil = require('./server.oil')
  , inherits = require('util').inherits
  , base64id = require('base64id')
  , debug = require('debug')

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

Server.prototype.handshake = function(transport, req){
  var id = base64id.generateId();

  debug('handshaking client "%s"', id);

  try {
    var transport = new transports[transport](req);
  }
  catch (e) {
    sendErrorMessage(req.res, Server.errors.BAD_REQUEST);
    return;
  }
  var socket = new Socket(id, this, transport);
  var self = this;

  if (false !== this.cookie) {
    transport.on('headers', function(headers){
      headers['Set-Cookie'] = self.cookie + '=' + id;
    });
  }

  transport.onRequest(req);

  this.clients[id] = socket;
  this.clientsCount++;
  this.emit('connection', socket);

  socket.once('close', function(){
    delete self.clients[id];
    self.clientsCount--;
  });
};
