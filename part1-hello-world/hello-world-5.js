// a function can be passed around as a variable
var g = function greeting(greetedPerson) {
          console.log("Hello "+ greetedPerson + "!");
        }

var greetee = process.argv[2]; 

function reception( greetFunction, greetee) {
  greetFunction(greetee);
}  

reception(g, greetee);
