// Handle REST GET requests (GET) for departments
var express = require('express') //npm install express
,   fs = require('fs');

var departments  = JSON.parse(fs.readFileSync('departments.json', 'utf8'));

var app = express()
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
  for (var i=0; i< departments.length; i++) {
    if (departments[i].DEPARTMENT_ID == departmentIdentifier) {
	  return departments[i];
    }//if	  
  }//for
  return {"DEPARTMENT_ID":0,"DEPARTMENT_NAME":"Does not exist ("+departmentIdentifier+")"}
}// getDepartment