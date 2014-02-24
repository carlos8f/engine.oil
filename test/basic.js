var Browser = require("zombie")
  , assert = require("assert")
  , spawn = require('child_process').spawn
  , port = Math.round(Math.random() * 20000 + 20000)
  , resolve = require('path').resolve
  , idgen = require('idgen')

describe('chat test', function() {
  var server, browser1, browser2;
  before(function(done) {
    server = spawn('node', [resolve(__dirname, './server/server.js'), '--port', port]);
    server.stdout.once('data', function(chunk) {
      done();
    });
    server.stderr.pipe(process.stdout);
  });
  before(function(done) {
    browser1 = new Browser();
    browser1.visit('http://localhost:' + port + '/', function() {
      done();
    });
  });
  before(function(done) {
    browser2 = new Browser();
    browser2.visit('http://localhost:' + port + '/', function() {
      done();
    });
  });
  after(function() {
    server.kill();
  });

  it('browser1 logs in', function(done) {
    browser1
      .fill('nick', 'browser1')
      .pressButton('Enter chat', function() {
        setTimeout(function() {
          assert.equal(browser1.text('#nick-display'), 'browser1');
          assert.equal(browser1.text('#nicknames'), 'Onlinebrowser1');
          done();
        }, 1000);
      });
  });
  it('browser2 logs in', function(done) {
    browser2
      .fill('nick', 'browser2')
      .pressButton('Enter chat', function() {
        setTimeout(function() {
          assert.equal(browser2.text('#nick-display'), 'browser2');
          assert.equal(browser2.text('#nicknames'), 'Onlinebrowser1browser2');
          done();
        }, 1000);
      });
  });
  it('browser1 sees browser2', function() {
    assert.equal(browser1.text('#nicknames'), 'Onlinebrowser1browser2');
    assert(browser1.text('#lines').match(/browser2 connected/));
  });
  it('browser2 chats', function(done) {
    browser2
      .fill('message', 'hello there!')
      .pressButton('Send', function() {
        setTimeout(function() {
          assert.equal(browser1.text('#lines'), 'SystemConnected to the serverbrowser2 connectedbrowser2hello there!');
          done();
        }, 1000);
      });
  });
  it('browser1 chats', function(done) {
    browser1
      .fill('message', 'why hello!')
      .pressButton('Send', function() {
        setTimeout(function() {
          assert.equal(browser2.text('#lines'), 'SystemConnected to the serverbrowser1 connectedmehello there!browser1why hello!');
          done();
        }, 1000);
      });
  });
  var shortChat = idgen(), longChat = idgen(64000);
  it('browser1 chats something short', function(done) {
    browser1
      .fill('message', shortChat)
      .pressButton('Send', done);
  });
  it('browser1 chats something really long', function(done) {
    browser1
      .fill('message', longChat)
      .pressButton('Send', function() {
        setTimeout(function() {
          assert.equal(browser2.text('#lines'), 'SystemConnected to the serverbrowser1 connectedmehello there!browser1why hello!browser1' + shortChat + 'browser1' + longChat);
          done();
        }, 1000);
      });
  });
});