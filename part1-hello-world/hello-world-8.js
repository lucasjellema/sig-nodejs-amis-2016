// callback closures used with timeout
// invoke this program with: node hello-world-8.js name1 name2 name3

var g = function (greetedPersoon) {
          console.log("Hello "+ greetedPersoon + "!");
        }

function getGreeter ( greetee, greetFunction) {
  var toGreet = greetee;  
  console.log('I will greet '+ greetee + ' in a little while');
  // return the function (closure= function + local variable state) that timeout can later callback to
  return function () {  greetFunction(toGreet)};  // the reference to toGreet is established when the closure is created
}  

var args = process.argv.slice(2); // loose first two elements, because they are "node" and "hello-world-8.js"
// loop over all command line arguments passed into this program and execute anonymous function on each argument
args.forEach(function (val, index, array) {
    setTimeout( getGreeter(val, g), index*1500);
});

/* alternative code would be:
for (var i=0;i<args.length;i++) {
  setTimeout( getGreeter(args[i], g), i*1500);
}
*/

console.log('The Main Program Flow is Done!');
