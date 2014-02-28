var WebSocket = require('ws')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  ;

var Client = module.exports = function(uri) {
  this.uri = uri;
  this.ws = new WebSocket(uri);

  var self = this;

  this.ws.on('open', function() {
    self.emit('open');
  });

  this.ws.on('message', function(data) {
    // we don't care about binary, so we don't handle the optional 2nd param (flags)

    // TODO: parse for type of message
    var message = data;
    self.emit('message', message);

    // self.emit('history', history);
  });

};

util.inherits(Client, EventEmitter);


Client.prototype.send = function(message) {
  this.ws.send(message);
};
