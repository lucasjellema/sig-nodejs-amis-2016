// static file server for all resources in local directory public and below
// will server public/index.html when invoked at http://127.0.0.1:3000
var express = require('express'); //npm install express

express().use(express.static(__dirname + '/public'))
    .listen(3000);

console.log('server running on port 3000');