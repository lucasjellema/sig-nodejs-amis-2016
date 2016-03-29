// my almost first Node.js program
function greeting(greetedPerson) {
  console.log("Hello "+ greetedPerson + "!");
}

// assume command line: node hello-world-3.js someName
var greetee = process.argv[2]; // index 0 will be node, index 1 is hello-world-3.js and index 2 is "someName"

greeting(greetee);
