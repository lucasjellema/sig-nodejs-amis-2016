// serve static file: /public/index.html
var http = require('http')
,   fs= require('fs');

var server = http.createServer(function handleRequest(req, res) {
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.createReadStream('./public/index.html').pipe(res);
}).listen(3000);

console.log('server running on port 3000');