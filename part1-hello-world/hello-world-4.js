// my almost first Node.js program
var g = function greeting(greetedPerson) {
          console.log("Hello "+ greetedPerson + "!");
        }

var greetee = process.argv[2]; 

g(greetee);
