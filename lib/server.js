var WebSocketServer = require('ws').Server;

var Server = module.exports = function(port) {
  this.wss = null;
  this.port = port;
  this.started = false;
};

Server.prototype.start = function(callback) {
  if (this.started) throw new Error('already started on port ' + this.port);

  this.wss = new WebSocketServer({ port: this.port });
  this.started = true;

  this.wss.on('connection', function(ws) {

    ws.on('message', function(message) {
      // TODO parse to see if command or normal message
      ws.send(message);
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
}
