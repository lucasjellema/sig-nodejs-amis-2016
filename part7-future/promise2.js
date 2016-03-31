var Q = require('q');

var deferred = Q.defer();
var promise = deferred.promise;

function doStuff(yourPromise) {
  // here we specify what upon resolution of this promise should be done.
  yourPromise.then(function (val) {
      console.log('here in doStuff, we think that this should be done!', val);
});

}

// we allow the function doStuff to determine what upon resolution of the promise - at some future point in time - should be done
doStuff(promise);

// at this point, doStuff has prepped the promise with functionality. Something spectacular, that depends on the promise being resolved- could happen now.
// after some time, processing, perhaps other promises we are waiting for, the promises gets resolved
deferred.resolve('final value'); // done with: final value
// now we will see the functionality that doStuff had prepared spring into action.
console.log('bye');