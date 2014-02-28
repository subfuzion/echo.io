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

var Server = module.exports = function() {
  this.wss = null;
  this.port = 0;
  this.started = false;
  this.history = new History(nconf.get('MAX_HISTORY'));
};

Server.prototype.start = function(port, callback) {
  var self = this;

  if (port < 1024 && port > 65535) {
    return callback(new Error('invalid port (1024-65535): ' + port));
  }

  this.port = port;

  if (this.started) {
    return callback(new Error('already started on port ' + this.port));
  }

  this.wss = new WebSocketServer({ port: this.port });
  this.started = true;

  this.wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      var response = {
        status: 'OK'
      };

      if (/^\[HISTORY\]/.test(message)) {
        response.messages = self.history.toArray();
      } else {
        self.history.push(message);
        response.messages = [ message ];
      }
      ws.send(JSON.stringify(response));
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

