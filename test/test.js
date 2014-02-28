var assert = require('assert')
  , echo = require('..')
  , port = 5555
  , uri = 'ws://localhost:' + port
  ;

var notImplementedError = new Error('not implemented yet');

describe ('echo server test suite', function() {

  it ('should start on specified TCP port', function(done) {
    var server = new echo.Server(port);
    server.start(function(err) {
      // release port for subsequent tests
      if (!err) server.close();
      done(err);
    });
  });

  it ('should callback with an error when the address is in use', function(done) {
    var server = new echo.Server(port);

    server.start(function(err) {
      if (err) return done(err);

      // server started ok
      // confirm that we can't start another server on the same port
      var server2 = new echo.Server(port);
      server2.start(function(err) {
        // release port for subsequent tests
        server.close();

        // expected a callback error
        assert.equal(err.code, 'EADDRINUSE');
        done();
      })
    });
  });

  it ('should echo received messages', function(done) {
    var message = 'hello';

    var server = new echo.Server(port);
    var client = new echo.Client(uri);

    server.start(function(err) {
      if (err) return done(err);

      client.on('message', function(echo) {
        assert.equal(echo, message);
        done();
      });

      client.on('open', function() {
        client.send(message);
      });
    });

  });

  it.skip ('should process HISTORY command to return message history', function(done) {
    done(notImplementedError);
  });

});

describe.skip ('echo client test suite', function() {

  it ('should send messages on specified port', function(done) {
    done(notImplementedError);
  });

  it ('should return server response plus response time', function(done) {
    done(notImplementedError);
  });

  it ('should return message history from server', function(done) {
    done(notImplementedError);
  });

  it ('should be able to filter message history', function(done) {
    done(notImplementedError);
  });

});
