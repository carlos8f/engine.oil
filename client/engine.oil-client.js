function Client(options) {
  options || (options = {});
  eio.EventEmitter.call(this);
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
  this.connect();
}
eio.util.inherits(Client, eio.EventEmitter);
exports.Client = Client;

Client.prototype.connect = function() {
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
    else {
      self.reconnect();
    }
  });
  this.socket.on('error', function(err) {
    self.emit('error', err);
  });
  this.socket.on('message', function(msg) {
    var unpacked = JSON.parse(msg);
    if (unpacked.ev) {
      self.emit.apply(self, [unpacked.ev].concat(unpacked.args));
    }
  });
};
Client.prototype.reconnect = function() {
  if (this.connected) {
    return;
  }
  if (this.reconnectAttempts === 0) {
    this.emit('reconnecting');
  }
  this.reconnectAttempts++;
  this.connect();
  var self = this;
  self.reconnectTimeout *= self.options.reconnectBackoff;
  setTimeout(function() {
    self.reconnect();
  }, self.reconnectTimeout);
};
Client.prototype.send = function(name, data) {
  this.socket.send(JSON.stringify({ev: name, args: Array.prototype.slice.call(arguments, 1)}));
};
Client.prototype.close = function(reason, desc) {
  this.socket.close(reason, desc);
};