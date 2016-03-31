var Q = require('q');

var i=0;
console.log('the beginning');

function getPromise() {
    console.log(i+++' prepare the promise');

    var deferred = Q.defer();

    // Resolve the promise after a second
    setTimeout(function () {
        deferred.resolve('final value');
    }, 1000);
    console.log(i+++' the promise is set to be resolved in 1 second');

    return deferred.promise;
}

var promise = getPromise();
console.log(i+++' Promise has arrived in main flow; we will next determine what it should do when resolved.');
promise.then(function (val) {
    console.log(i+++' done with:', val);
});
console.log(i+++' main flow is done; perhaps we have some asynchronous pending stuff, such as as yet unfulfilled promises and their associated action-upon-resolution');