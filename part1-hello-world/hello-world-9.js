var util = require('util');
var g = function (greetedPerson) {
          util.log(util.format('Hello %s!', greetedPerson));
        }

function getGreeter ( greetee, greetFunction) {
  var toGreet = greetee;  
  util.log(util.format('I will greet %s in a little while', toGreet));
  // return the function (closure= function + local variable state) that timeout can later callback to
  return function () {  greetFunction(toGreet)};  // the reference to toGreet is established when the closure is created
}  

process.argv.slice(2).forEach(function (val, index, array) {
    setTimeout( getGreeter(val, g), index*1500);
});

util.log('The Main Program Flow is Done!');
