// Handle REST requests (POST and GET) for departments
var express = require('express') //npm install express
,   bodyParser = require('body-parser') // npm install body-parser
,   fs = require('fs')
,   https = require('https');

var departments  = JSON.parse(fs.readFileSync('departments.json', 'utf8'));

var app = express()
           .use(bodyParser.urlencoded({  extended: true}))
		   .post('/forms/department', function (req, res) { //process 
               console.log(JSON.stringify(req.body));	 
               departments.push( {"DEPARTMENT_ID":req.body.departmentId,"DEPARTMENT_NAME":req.body.departmentName});			   
		       res.end('Thank you for the new department '+ req.body.departmentId+" "+req.body.departmentName);
		    })
		   .get('/departments/:departmentId', function (req, res) { //process 
		       var department = getDepartment(req.params['departmentId']);
			   console.log(JSON.stringify(department));
			   res.send( department); //using send to stringify and set content-type
		    })
			.get('/departmentdetails/:departmentId', function (req, res) { //process 
			   var departmentId = req.params['departmentId'];
		       var department = getDepartment(departmentId);
			   // get employee details for department from remote API
			   https.get({ host: 'data-api-lucasjellema.apaas.em2.oraclecloud.com',
                          port: 443,
                          path: '/departments/'+departmentId,
                          method: 'GET'
                        }, function handleRemoteResponse(resp) {
                 var body="";
                 resp.on("data", function(chunk) { // response returned in chunks
    	                  body = body+chunk;
                       });
                 resp.on("end", function() { // when response is received, pass it on
				          console.log("department details"+ body);
				          department.employees = JSON.parse(body);
                          res.send(department); //using send to stringify and set content-type
                       });
                   }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                       });
			})
		   .get('/departments', function (req, res) { //process 
			   res.send( departments); //using send to stringify and set content-type
		    })
           .use(express.static(__dirname + '/public'))
		   .listen(3000);

console.log('server running on port 3000');

function getDepartment(departmentIdentifier) {
  for (var i=0; i< departments.length; i++) {
    if (departments[i].DEPARTMENT_ID == departmentIdentifier) {
	  return departments[i];
    }//if	  
  }//for
  return {"DEPARTMENT_ID":0,"DEPARTMENT_NAME":"Does not exist ("+departmentIdentifier+")"}
}// getDepartment