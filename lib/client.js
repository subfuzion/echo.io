var WebSocket = require('ws')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , _ = require('underscore')
  ;

var Client = module.exports = function (uri) {
  this.uri = uri;
  this.ws = null;
  this.history = null;
  this.lastSentTimestamp = null;
  this.lastReceivedTimestamp = null;
  this.cache = null;

  this.ws = new WebSocket(uri);

  var self = this;

  this.ws.on('error', function (err) {
    self.emit('error', err);
  });

  this.ws.on('open', function () {
    self.emit('open');
  });

  this.ws.on('message', function (data) {
    // we don't care about binary, so we don't handle the optional 2nd param (flags)

    self.lastReceivedTimestamp = new Date().getTime();

    var message = JSON.parse(data);

    message.responseTime = self.lastReceivedTimestamp - self.lastSentTimestamp;

    // if this is a history message, cache it
    // in case the user wants to filter messages
    if (message.type === "history") {
      self.cache = message.messages.length > 1
        ? message
        : null;
    }

    self.emit('message', message);
  });

};

util.inherits(Client, EventEmitter);


Client.prototype.send = function (message) {
  if (!message) return;
  this.lastSentTimestamp = new Date().getTime();
  this.ws.send(message);
};

Client.prototype.sendHistoryCommand = function () {
  this.lastSentTimestamp = new Date().getTime();
  this.ws.send('[HISTORY]');
};

Client.prototype.historyFilter = function(pattern) {
  if (!this.cache) return [];
  if (!pattern) return this.cache;

  var regex = new RegExp(pattern, "i");
  var filtered =
    _.filter(this.cache.messages, function(message) { return regex.test(message) });

  var messages = this.cache.messages;

  return {
    status: this.cache.status,
    responseTime: this.cache.responseTime,
    messages: filtered
  }
};

