// respond to HTTP requests with appropriate response
// invoke from browser or using curl:  curl http://127.0.0.1:3000/do/me/a/resource?name=Lex
var http = require('http')
,   url = require('url') ;
var server = http.createServer(function handleRequest(req, res) {
    console.log('URL '+ req.url);
	var queryObject = url.parse(req.url,true).query;
	var name = queryObject.name;
    console.log('path: '+url.parse(req.url).pathname);
    console.log('queryObject: '+JSON.stringify(queryObject));
    res.write('Hello '+ name + '!');
    res.end();
}).listen(3000);

console.log('server running on port 3000');