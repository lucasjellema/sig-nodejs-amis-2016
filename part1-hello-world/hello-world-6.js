// functions can be anonymous 
var g = function (greetedPerson) {
          console.log("Hello "+ greetedPerson + "!");
        }

var greetee = process.argv[2]; 

var r = function ( greetFunction, greetee) {
  greetFunction(greetee);
}  

r(g, greetee);
