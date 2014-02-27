var assert = require('assert');

var notImplementedError = new Error('not implemented yet');

describe ('echo server test suite', function() {

  it ('should start on specified TCP port', function(done) {
    done(notImplementedError);
  });

  it ('should echo received messages', function(done) {
    done(notImplementedError);
  });

  it ('should process HISTORY command to return message history', function(done) {
    done(notImplementedError);
  });

});

describe ('echo client test suite', function() {

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
