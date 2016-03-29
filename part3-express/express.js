//respond to HTTP requests with static response
// invoke from browser or using curl:  curl http://127.0.0.1:3000
var express = require('express')
,   http = require('http');

var app = express()
          .use(function (req, res, next) {
                res.end('Hello World!');
           });

// Create HTTP server with Express app as the request listener 
http.createServer(app)
    .listen(3000);

console.log('server running on port 3000');