var io = require('socket.io');

var Server = module.exports = function(port) {
  this.port = port;
};
