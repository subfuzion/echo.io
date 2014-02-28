var WebSocketServer = require('ws').Server
  , nconf = require('nconf')
  , filepath = '../config.json'
  , History = require('./history')
  ;

// load setting for max history in order of descending precedence
nconf
  .argv()
  .env()
  .file({ file: filepath })
  .defaults({ MAX_HISTORY: 100 });

var Server = module.exports = function(port) {
  this.wss = null;
  this.port = port;
  this.started = false;
  this.history = new History(nconf.get('MAX_HISTORY'));
};

Server.prototype.start = function(callback) {
  var self = this;

  if (this.started) throw new Error('already started on port ' + this.port);

  this.wss = new WebSocketServer({ port: this.port });
  this.started = true;

  this.wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      if (/^\[HISTORY\]/.test(message)) {
        var response = JSON.stringify(self.history.toArray());
        ws.send(response);
      } else {
        self.history.push(message);
        ws.send(message);
      }
    });
  });

  this.wss.on('error', function(err) {
    callback(err);
  });

  this.wss.on('listening', function() {
    callback( /*success*/ );
  })
};

/**
 * This can throw an error
 * https://github.com/einaros/ws/blob/master/lib/WebSocketServer.js#L125
 */
Server.prototype.close = function() {
  if (this.started && this.wss) {
    this.wss.close();
  }

  this.wss = null;
  this.started = false;
};

