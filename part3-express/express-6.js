// Handle REST requests (POST and GET) for departments
var express = require('express') //npm install express
,   bodyParser = require('body-parser') // npm install body-parser
,   fs = require('fs');

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
		   .get('/departments', function (req, res) { //process 
			   res.send( departments); //using send to stringify and set content-type
		    })
           .use(express.static(__dirname + '/public'))
		   .listen(3000);

console.log('server running on port 3000');

function getDepartment(departmentIdentifier) {
  for (var department of departments) {
    if (department.DEPARTMENT_ID == departmentIdentifier) {
	  return department;
    }//if	  
  }//for
  return {"DEPARTMENT_ID":0,"DEPARTMENT_NAME":"Does not exist ("+departmentIdentifier+")"}
}// getDepartment