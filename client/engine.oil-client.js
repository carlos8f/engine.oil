function Client(options) {
  options || (options = {});
  eio.Emitter.call(this);
  this.reconnectAttempts = 0;
  this.options = {};
  for (var k in options) {
    if (options.hasOwnProperty(k)) {
      this.options[k] = options[k];
    }
  }
  this.options.reconnectTimeout = this.reconnectTimeout = this.options.reconnectTimeout || 1000;
  this.options.reconnectBackoff || (this.options.reconnectBackoff = 1.7);
  this.connected = false;
  this.reconnecting = false;
  this.connect();
}
eio.util.inherits(Client, eio.Emitter);
exports.Client = Client;

exports.connect = function(options) {
  options || (options = {});
  if (!options.port && document && document.location) {
    options.port = document.location.port;
  }
  if (!options.host && document.domain) {
    options.host = document.domain;
  }
  return new Client(options);
};

function getURI(options) {
  var protocol = options.protocol
    , host = options.host
    , port = options.port;

  if ('document' in global) {
    host = host || document.domain;
    port = port || (protocol == 'https'
      && document.location.protocol !== 'https:' ? 443 : document.location.port);
  }
  else {
    host = host || 'localhost';

    if (!port && protocol == 'https') {
      port = 443;
    }
  }

  return (protocol || 'http') + '://' + host + ':' + (port || 80);
};

Client.prototype.connect = function() {
  if (this.socket) {
    this.socket.removeAllListeners();
  }
  this.socket = new eio.Socket(this.options);
  var self = this;
  this.socket.on('open', function() {
    self.connected = true;
    self.reconnectAttempts = 0;
    self.reconnectTimeout = self.options.reconnectTimeout;
    self.emit('connect');
  });
  this.socket.on('close', function(reason, desc) {
    self.connected = false;
    if (reason === 'forced close') {
      self.emit('close', reason, desc);
    }
    else if (self.reconnectAttempts === 0) {
      self.emit('reconnecting');
      self.reconnectAttempts++;
      self.connect();
    }
    else {
      self.reconnectAttempts++;
      self.reconnectTimeout *= self.options.reconnectBackoff;
      setTimeout(function() {
        if (self.connected) {
          return;
        }
        self.connect();
      }, self.reconnectTimeout);
    }
  });
  this.socket.on('error', function(err) {
    self.emit('error', err);
  });
  this.socket.on('message', function(msg) {
    var unpacked = hydration.hydrate(JSON.parse(msg))
    if (unpacked.ev) {
      self.emit.apply(self, [unpacked.ev].concat(unpacked.args));
    }
  });
};
Client.prototype.send = function(ev, args) {
  if (Object.prototype.toString.call(ev) === '[object Array]') {
    args = ev;
    ev = args.shift();
  }
  else {
    args = Array.prototype.slice.call(arguments, 1);
  }
  var cb;
  if (typeof args[args.length - 1] === 'function') {
    cb = args.pop();
  }
  var envelope = {
    ev: ev,
    args: args
  };
  if (cb) {
    envelope.ack = idgen();
    this.on(envelope.ack, cb);
  }
  this.socket.send(JSON.stringify(hydration.dehydrate(envelope)));
};
Client.prototype.close = function(reason, desc) {
  this.socket.close(reason, desc);
};