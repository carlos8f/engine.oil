var engine = require('engine.io')
  , resolve = require('path').resolve
  , buffet = require('buffet')(resolve(__dirname, '../public'), {watch: false})
  , http = require('http')
  , middler = require('middler')

exports.BaseSocket = engine.Socket;
exports.BaseServer = engine.Server;

exports.__proto__ = engine.__proto__;

exports.__proto__.Socket = require('./socket');
exports.__proto__.Server = require('./server');

/**
 * Captures upgrade requests for a http.Server.
 *
 * @param {http.Server} server
 * @param {Object} options
 * @return {Server} engine server
 * @api public
 */

exports.attach = function(server, options) {
  middler(server, buffet);
  
  return engine.attach(server, options);
};