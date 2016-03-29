// static file server for all resources in local directory public and below
// AND handle forms submission to path /forms/... 
var express = require('express'); //npm install express
var bodyParser = require('body-parser'); // npm install body-parser

var app = express()
           .use(bodyParser.urlencoded({  extended: true}))
		   .post('/forms/*', function (req, res) { //process 
               console.log(JSON.stringify(req.body));	    
		       res.end('Thank you '+ req.body.firstname+" "+req.body.lastname);
		    })
           .use(express.static(__dirname + '/public'))
		   .listen(3000);

console.log('server running on port 3000');