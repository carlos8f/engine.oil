var engine = require('engine.io')
  , resolve = require('path').resolve
  , buffet = require('buffet')(resolve(__dirname, '../public'), {watch: false})
  , http = require('http')
  , middler = require('middler')

exports.BaseSocket = engine.Socket;
exports.BaseServer = engine.Server;

Object.keys(engine).forEach(function(k) {
  exports[k] = engine[k];
});

exports.Socket = require('./socket');
exports.Server = require('./server');
engine.Server = exports.Server;
engine.Socket = exports.Socket;

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