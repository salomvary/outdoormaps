/**
 * Lightweight Promises/A+ implementation
 *
 * Inspired by PinkySwear and others.
 * https://github.com/timjansen/PinkySwear.js
 *
 * WARNING This is not a fully compliant implementation: it lacks
 * a few features and doesn't handle corner cases at all.
 */
export default function Promise(resolver) {
  var PENDING = 0,
    RESOLVED = 1,
    REJECTED = 2;
  var state = PENDING;
  var callbacks = [];
  var value;

  this.then = function(onResolved, onRejected) {
    return new Promise(function(resolve, reject) {
      function applyCallbacks() {
        var fn = state === RESOLVED ? onResolved : onRejected;
        if (fn) {
          var result = fn(value);
          if (result && result.then) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } else {
          fn = state === RESOLVED ? resolve : reject;
          fn(value);
        }
      }
      if (state === PENDING) {
        callbacks.push(applyCallbacks);
      } else {
        applyCallbacks();
      }
    });
  };

  function resolve(value) {
    fulfill(RESOLVED, value);
  }

  function reject(value) {
    fulfill(REJECTED, value);
  }

  function fulfill(resolution, val) {
    state = resolution;
    value = val;
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }
    callbacks = null;
  }

  resolver(resolve, reject);
}

function makePromise(which, value?) {
  return new Promise(function() {
    arguments[which](value);
  });
}

Promise.resolve = makePromise.bind(null, 0);

Promise.reject = makePromise.bind(null, 1);

Promise.chain = function(functions) {
  return functions.reduce(function(prev, fn) {
    return prev.then(fn);
  }, makePromise(0));
};
