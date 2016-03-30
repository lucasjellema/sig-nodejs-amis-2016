// serve resource from remote web site, retrieved over http
var http = require('http')
    ;

var options = {
  host: 'www.un.org',
  path: '/en/universal-declaration-human-rights/',
};

var server = http.createServer(function handleRequest(req, res) {
console.log(req.url);
    res.writeHead(200, { 'content-type': 'text/html' });
    http.get(options, function handleRemoteResponse(resp) {
       var body="";
       resp.on("data", function(chunk) { // response returned in chunks
    	  body = body+chunk;
       });
       resp.on("end", function() { // when response is received, pass it on
          res.end(body);
       });
    }).on('error', function(e) {
       console.log("Got error: " + e.message);
    });
    }).listen(3000);

console.log('server running on port 3000');