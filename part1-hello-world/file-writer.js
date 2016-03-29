//write a file with all command line arguments on separate lines
//invoke with:  node file-writer one two three four vijf sechs siete huit

var fs = require('fs')
,   util = require('util');

process.argv.slice(2).forEach(function (val) {
  fs.appendFileSync("./output.txt", val + "\n");
});

util.log('The Main Program Flow is Done!');
