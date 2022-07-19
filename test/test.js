var assert = require('assert')
  , _ = require('underscore')
  , echo = require('..')
  , port = 5555
  , uri = 'ws://localhost:' + port
  ;

// include ringbuffer unit test
require('./ringbuffertest');

describe('echo server test suite', function () {

  it('should start on specified TCP port', function (done) {
    var server = new echo.Server();

    server.on('error', function(err) {
      done(err);
    });

    server.on('listening', function(port_) {
      assert(port_, port);
      server.close();
      done();
    });

    server.start(port);
  });

  it('should emit a close event when closed', function (done) {
    var server = new echo.Server();

    server.on('error', function(err) {
      done(err);
    });

    // the test will fail by timing out if 'close' is never emitted
    server.on('close', function(closedPort) {
      assert(closedPort, port);
      done();
    });

    server.on('listening', function() {
      // release port for subsequent tests
      server.close();
    });

    server.start(port);
  });

  it('should callback with an error when the address is in use', function (done) {
    var server1 = new echo.Server();

    server1.on('error', function(err) {
      done(err);
    });

    server1.on('listening', function(port1) {
      // confirm that we can't start another server on the same port
      var server2 = new echo.Server();

      server2.on('error', function(err) {
        // release port for subsequent tests
        server1.close();

        // expected an error -- shouldn't be able to use the same port
        assert.equal(err.code, 'EADDRINUSE');
        done();
      });

      server2.on('listening', function(port2) {
        // release port for subsequent tests
        server1.close();
        server2.close();

        assert.fail(port2, port1, 'should not be able to start server on the same port');
        done();
      });

      server2.start(port);
    });

    server1.start(port);
  });

  it('should emit connection event when client connects', function (done) {
    var server = new echo.Server();

    server.on('error', function(err) {
      done(err);
    });

    server.on('connection', function() {
      server.close();
      done();
    });

    server.on('listening', function() {
      var client = new echo.Client(uri);
    });

    server.start(port);
  });

  it('should echo received messages', function (done) {
    var message = 'hello';

    var server = new echo.Server();
    var client = new echo.Client(uri);

    server.on('error', function(err) {
      done(err);
    });

    server.on('listening', function() {
      client.on('open', function () {
        client.send(message);
      });

      client.on('message', function (echo) {
        // release port for subsequent tests
        server.close();

        assert.equal(echo.type, 'message');
        assert.equal(echo.message, message);

        done();
      });
    });

    server.start(port);
  });

  it('should process HISTORY command to return message history', function (done) {
    var count = 200;
    var max = count > 100 ? 100 : count;

    // prepare an array with all the messages
    var messages = _.range(count).map(function (val) { return 'message-' + val });

    var server = new echo.Server();
    var client = new echo.Client(uri);

    server.on('error', function(err) {
      done(err);
    });

    server.on('listening', function() {
      var i = 0;

      client.on('open', function () {
        _.each(messages, function(message) {
          client.send(message);
        });
      });

      client.on('message', function (message) {
        i++;

        if (i == count) {
          // all the messages have been sent
          client.sendHistoryCommand();
        }

        if (i > count) {
          // after all of the echoes, this is the history message
          var history = message.messages;
          assert.equal(message.type, 'history');
          assert.equal(history.length, max);

          // compare history to sent messages
          for (i = 0; i < max; i++) {
            var actual = history[i];
            var expected = messages[messages.length - i - 1];
            assert(actual, expected);
          }

          server.close();
          done();
        }
      });
    });

    server.start(port);
  });
});

describe('echo client test suite', function () {

  it('should report error when unable to connect', function (done) {
    var message = 'hello';
    var client = new echo.Client(uri);

    client.on('error', function(err) {
      assert.equal(err.code, 'ECONNREFUSED');
      done();
    });
  });

  it('should send messages on specified port', function (done) {
    var message = 'hello';

    var server = new echo.Server();
    var client = new echo.Client(uri);

    server.on('error', function(err) {
      done(err);
    });

    server.on('listening', function() {
      client.on('message', function (echo) {
        // release port for subsequent tests
        server.close();

        assert.equal(echo.message, message);
        done();
      });

      client.on('open', function () {
        client.send(message);
      });
    });

    server.start(port);
  });

  it('should return server response plus response time', function (done) {
    var message = 'hello';

    var server = new echo.Server();
    var client = new echo.Client(uri);

    server.on('error', function(err) {
      done(err);
    });

    server.on('listening', function() {
      client.on('message', function (echo) {
        // release port for subsequent tests
        server.close();

        assert.equal(echo.message, message);
        assert.equal(typeof echo.responseTime, 'number');
        assert(echo.responseTime >= 0);

        done();
      });

      client.on('open', function () {
        client.send(message);
      });
    });

    server.start(port);
  });

  it('should be able to filter message history', function (done) {
    // prepare an array with all the messages
    var messages = [
      'how now brown cow',
      'hello world',
      'silly sally sells seashells by the seashore',
      'goodbye cruel world'
    ];

    var count = messages.length;

    var server = new echo.Server();
    var client = new echo.Client(uri);

    server.on('error', function(err) {
      done(err);
    });

    server.on('listening', function() {
      var i = 0;

      client.on('open', function () {
        _.each(messages, function(message) {
          client.send(message);
        });
      });

      client.on('message', function (message) {
        var actual, expected, filtered;

        i++;

        if (i === count) {
          // all the messages have been sent
          client.sendHistoryCommand();
        }

        if (i > count) {
          // after all of the echoes, this is the history message
          var history = message.messages;
          // console.log(message);

          // compare history to sent messages
          for (i = 0; i < count; i++) {
            actual = history[i];
            expected = messages[messages.length - i - 1];
            assert(actual, expected);
          }

          filtered = client.historyFilter('e').messages;
          assert(filtered[0], messages[3]);
          assert(filtered[1], messages[2]);
          assert(filtered[2], messages[1]);

          filtered = client.historyFilter('BROWN').messages;
          assert(filtered[0], messages[0]);

          filtered = client.historyFilter('kitty').messages;
          assert.equal(filtered.length, 0);

          server.close();
          done();
        }
      });
    });

    server.start(port);
  });

});
