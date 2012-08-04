var engine = require('engine.io')
  , resolve = require('path').resolve
  , buffet = require('buffet')(resolve(__dirname, '../public'), {watch: false})
  , http = require('http')

Object.keys(engine).forEach(function(k) {
  exports[k] = engine[k];
});
exports.Server = require('./server');
exports.Socket = require('./socket');

exports.listen = function(port, options, fn) {
  if ('function' == typeof options) {
    fn = options;
    options = {};
  }

  var server = http.createServer(function (req, res) {
    res.writeHead(501);
    res.end('Not Implemented');
  });

  server.listen(port, fn);

  // create engine server
  var engine = exports.attach(server, options);
  engine.httpServer = server;

  return engine;
};

exports.attach = function (server, options) {
  options || (options = {});
  options.serverClass || (options.serverClass = exports.Server);
  options.socketClass || (options.socketClass = exports.Socket);
  
  // cache and clean up listeners
  var listeners = server.listeners('request')
    , oldListeners = []

  // copy the references onto a new array for node >=0.7
  for (var i = 0, l = listeners.length; i < l; i++) {
    oldListeners[i] = listeners[i];
  }

  server.removeAllListeners('request');

  // add request handler
  server.on('request', function (req, res) {
    buffet(req, res, function() {
      for (var i = 0, l = oldListeners.length; i < l; i++) {
        oldListeners[i].call(server, req, res);
      }
    });
  });

  return engine.attach(server, options);
};
