var http = require('http')
  , engine = require('../../')
  , argv = require('optimist')
    .alias('p', 'port')
    .default('port', 3000)
    .argv
  , path = require('path')
  , pub = path.resolve(__dirname, './public')
  ;

var buffet = require('buffet')(pub);

var server = http.createServer();
var io = engine.attach(server);

server.on('request', buffet);
server.listen(argv.port, function() {
  console.log('test server running on port ' + argv.port);
});

var nicknames = {};
io.on('connection', function(socket) {
  socket.oil.on('user message', function(msg) {
    socket.oil.in('chat').broadcast('user message', nicknames[socket.id], msg);
  });

  socket.oil.on('nickname', function(nick, cb) {
    if (nicknameTaken(socket.id, nick)) {
      cb(true);
    }
    else {
      socket.oil.join('chat');
      nicknames[socket.id] = nick;
      cb(false);
      socket.oil.broadcast('announcement', nick + ' connected');
      sendNicks();
    }
  });

  socket.on('close', function () {
    if (!nicknames[socket.id]) return;

    socket.oil.in('chat').broadcast('announcement', nicknames[socket.id] + ' disconnected');
    delete nicknames[socket.id];
    sendNicks();
  });

  socket.on('error', function(err) {
    console.error(err);
  });
});

function nicknameTaken(id, nick) {
  if (!nick || nick === '' || nicknames[id]) {
    return true;
  }
  var taken = false;
  Object.keys(nicknames).forEach(function(socketId) {
    if (nicknames[socketId] === nick) {
      taken = true;
    }
  });
  return taken;
}

function sendNicks() {
  var nicks = [];
  Object.keys(nicknames).forEach(function(id) {
    nicks.push(nicknames[id]);
  });
  nicks.sort();
  io.oil.in('chat').send('nicknames', nicks);
}