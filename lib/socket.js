var BaseSocket = require('engine.io').Socket
  , SocketOil = require('./socket.oil')
  , inherits = require('util').inherits

function Socket(id, server, transport) {
  this.oil = new SocketOil({server: server, socket: this});
  BaseSocket.call(this, id, server, transport);
}
inherits(Socket, BaseSocket);
module.exports = Socket;