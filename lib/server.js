var WebSocketServer = require('ws').Server
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , settings = require('../config.json')
  , History = require('./history')
  ;

var Server = module.exports = function() {
  this.wss = null;
  this.port = 0;
  this.started = false;
  this.history = new History(settings.MAX_HISTORY);
};

util.inherits(Server, EventEmitter);

Server.prototype.start = function(port) {
  var self = this;

  if (port < 1024 && port > 65535) {
    return callback(new Error('invalid port (1024-65535): ' + port));
  }

  this.port = port;

  if (this.started) {
    self.emit('error', new Error('already started on port ' + this.port));
  }

  this.wss = new WebSocketServer({ port: this.port });

  this.started = true;

  this.wss.on('error', function(err) {
    self.emit('error', err);
  });

  this.wss.on('listening', function() {
    self.emit('listening', self.port);
  });

  // wss doesn't appear to emit a close event like socket.io
  // so we will emit a close event explicitly from our own close method
  // https://github.com/einaros/ws/blob/master/lib/WebSocketServer.js
  /*
  this.wss.on('close', function() {
    self.emit('close', self.port);
  });
  */

  this.wss.on('connection', function(ws, req) {
    // var host = ws.upgradeReq.headers.host;
    var host = req.url;

    self.emit('connection', ws, host);

    ws.on('message', function(message) {

      var response = {
        status: 'OK'
      };

      if (/^\[HISTORY\]$/.test(message)) {
        response.type = 'history';
        response.messages = self.history.toArray();
      } else if (/^\[PING\]$/.test(message)) {
        response.type = 'ping';
      } else {
        response.type = 'message';
        var m = Buffer.from(message).toString();
        response.messages = [m];
        self.history.push(m);
      }
      ws.send(JSON.stringify(response));
    });

    ws.on('error', function(err) {
      self.emit('clienterror', err, host);
    });

    ws.on('close', function(ws) {
      self.emit('clientclose', ws, host);
    });
  });
};

/**
 * This can throw an error
 * https://github.com/einaros/ws/blob/master/lib/WebSocketServer.js#L125
 */
Server.prototype.close = function() {
  if (this.started && this.wss) {
    this.wss.close();
    this.emit('close', this.port);
  }

  this.wss = null;
  this.started = false;
};
