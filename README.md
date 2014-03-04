echo.io
-------

A Node.js WebSocket server that echoes its messages and responds to history requests. A client and tests are also provided.

[Features](https://github.com/tonypujals/echo.io/issues/milestones?state=closed)

[Specifications](https://github.com/tonypujals/echo.io/wiki/Specifications)

Installation
============

The latest version is v0.0.5

    npm install git://github.com/tonypujals/echo.io.git#v0.0.5 --save


How to use it
=============

A server can be opened on ports in the range of 1024 - 65535. If there is an error, it will emit an event. Errors include invalid port request, already listening on port, address in use by another process, etc.

```
var echo = require('echo.io'),
  , port = 5000;
  
var server = new echo.Server();

server.start(port, function(err) {
  ...
});
```

Here is a more complex example demonstrating starting the server from a web application in response to a request:

```
var echo = require('echo.io')
  , echoserver;
  
... (set up app) ...


app.get('/api/v1/echoserver/:port/start', function (req, res) {
  var port = parseInt(req.params.port, 10);

  if (echoserver && echoserver.port == port) {
    return res.json({
      status: 'error',
      message: 'address in use ' + port
    });
  }

  echoserver = new echo.Server();

  echoserver.start(port, function(err) {
    var response;

    if (err) {
      console.log('error: ' + err.message);
      
      response = {
        status: 'error',
        message: err.message
      };
      
    } else {
      console.log('echo server started on port ' + port);
      
      response = {
        status: 'ok',
        message: 'echo server started on port ' + port
      };
    }

    res.json(response);
  });
});
```

### Errors

Typical Server events include invalid port request (it will 


Client
======

