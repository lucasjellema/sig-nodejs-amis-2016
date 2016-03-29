//respond to HTTP requests with static response
// invoke from browser or using curl:  curl http://127.0.0.1:3000
var http = require('http');

var server = http.createServer(function handleRequest(req, res) {
    res.write('Hello World!');
    res.end();
}).listen(3000);

console.log('server running on port 3000');