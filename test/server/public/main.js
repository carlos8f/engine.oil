var client = oil.connect(), nick;

client.on('connect', function() {
  message('System', 'Connected to the server');
});
client.on('error', function(err) {
  if (client.connected) {
    message('System', err.message ? err.message : 'A unknown error occurred');
  }
});
client.on('announcement', function(msg) {
  $('#lines').append($('<p>').append($('<em>').text(msg)));
});
client.on('nicknames', function(nicknames) {
  $('#nicknames').empty().append($('<h3>Online</h3><br>'));
  for (var i in nicknames) {
    $('#nicknames').append($('<b>').text(nicknames[i]), '<br>');
  }
});
client.on('user message', message);
client.on('reconnecting', function() {
  message('System', 'Attempting to re-connect to the server');
});
client.on('nickname', function(set) {
  if (!set) {
    $('#set-nickname').css('display', 'none');
    $('#send-message').removeClass('hide');
    $('#messages').removeClass('hide');
    clear();
    $('#nick-display').text(nick);
    return;
  }
  $('#set-nickname fieldset').addClass('error');
  $('#nickname-err').removeClass('hide');
});

function message(from, msg) {
  $('#lines').append($('<p>').append($('<b>').text(from), msg));
  $('#lines').get(0).scrollTop = 10000000;
}
function clear() {
  $('#message').val('').focus();
}

$(function() {
  $('#nickname').on('hidden', function() {
    $('#set-nickname fieldset').removeClass('error');
    $('#nickname-err').addClass('hide');
    $('#nick').val('');
  });
  $('#set-nickname').submit(function(e) {
    nick = $('#nick').val();
    client.send('nickname', nick);
    return false;
  });

  $('#send-message').submit(function() {
    message('me', $('#message').val());
    client.send('user message', $('#message').val());
    clear();
    return false;
  });
});
