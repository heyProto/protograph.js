if (typeof define !== 'function' && typeof requireModule !== 'function') {
  var define, requireModule;

  (function() {
    var registry = {}, seen = {};

    define = function(name, deps, callback) {
      registry[name] = { deps: deps, callback: callback };
    };

    requireModule = function(name) {
      if (seen[name]) { return seen[name]; }

      var mod = registry[name];

      if (!mod) {
        throw new Error("Module: '" + name + "' not found.");
      }

      var deps = mod.deps,
          callback = mod.callback,
          reified = [],
          exports;

      for (var i=0, l=deps.length; i<l; i++) {
        if (deps[i] === 'exports') {
          reified.push(exports = {});
        } else {
          reified.push(requireModule(deps[i]));
        }
      }

      var value = callback.apply(this, reified);

      return seen[name] = exports || value;
    };

    define.registry = registry;
    define.seen = seen;
  })();
}

/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.0.13
 */

(function() {
    "use strict";

    function $$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function $$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var $$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      on: function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if ($$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      off: function(eventName, callback) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = $$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {Any} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      trigger: function(eventName, options) {
        var allCallbacks = $$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options);
          }
        }
      }
    };

    var $$rsvp$config$$config = {
      instrument: false
    };

    $$rsvp$events$$default.mixin($$rsvp$config$$config);

    function $$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        $$rsvp$config$$config.on('error', value);
        return;
      }

      if (arguments.length === 2) {
        $$rsvp$config$$config[name] = value;
      } else {
        return $$rsvp$config$$config[name];
      }
    }

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$instrument$$queue = [];

    var $$instrument$$default = function instrument(eventName, promise, child) {
      if (1 === $$instrument$$queue.push({
          name: eventName,
          payload: {
            guid: promise._guidKey + promise._id,
            eventName: eventName,
            detail: promise._result,
            childGuid: child && promise._guidKey + child._id,
            label: promise._label,
            timeStamp: $$utils$$now(),
            stack: new Error(promise._label).stack
          }})) {

            setTimeout(function() {
              var entry;
              for (var i = 0; i < $$instrument$$queue.length; i++) {
                entry = $$instrument$$queue[i];
                $$rsvp$config$$config.trigger(entry.name, entry.payload);
              }
              $$instrument$$queue.length = 0;
            }, 50);
          }
      };

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
      $$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$fulfill(promise, value);
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('fulfilled', promise);
        }
      } else {
        $$rsvp$config$$config.async($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$rsvp$config$$config.async($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$rsvp$config$$config.async($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default(settled === $$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, new TypeError('A promises callback cannot return that same promise.'));
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$enumerator$$default = $$enumerator$$Enumerator;

    $$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$rsvp$promise$$guidKey = 'rsvp_' + $$utils$$now() + '-';
    var $$rsvp$promise$$counter = 0;

    function $$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$rsvp$promise$$default = $$rsvp$promise$$Promise;

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class RSVP.Promise
      @param {function} resolver
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */
    function $$rsvp$promise$$Promise(resolver, label) {
      this._id = $$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$rsvp$config$$config.instrument) {
        $$instrument$$default('created', this);
      }

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$rsvp$promise$$needsResolver();
        }

        if (!(this instanceof $$rsvp$promise$$Promise)) {
          $$rsvp$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    // deprecated
    $$rsvp$promise$$Promise.cast = $$promise$resolve$$default;

    $$rsvp$promise$$Promise.all = $$promise$all$$default;
    $$rsvp$promise$$Promise.race = $$promise$race$$default;
    $$rsvp$promise$$Promise.resolve = $$promise$resolve$$default;
    $$rsvp$promise$$Promise.reject = $$promise$reject$$default;

    $$rsvp$promise$$Promise.prototype = {
      constructor: $$rsvp$promise$$Promise,

      _guidKey: $$rsvp$promise$$guidKey,

      _onerror: function (reason) {
        $$rsvp$config$$config.trigger('error', reason);
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection, label) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          if ($$rsvp$config$$config.instrument) {
            $$instrument$$default('chained', this, this);
          }
          return this;
        }

        parent._onerror = null;

        var child = new this.constructor($$$internal$$noop, label);
        var result = parent._result;

        if ($$rsvp$config$$config.instrument) {
          $$instrument$$default('chained', parent, child);
        }

        if (state) {
          var callback = arguments[state - 1];
          $$rsvp$config$$config.async(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(null, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var constructor = this.constructor;

        return this.then(function(value) {
          return constructor.resolve(callback()).then(function(){
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function(){
            throw reason;
          });
        }, label);
      }
    };

    function $$rsvp$node$$Result() {
      this.value = undefined;
    }

    var $$rsvp$node$$ERROR = new $$rsvp$node$$Result();
    var $$rsvp$node$$GET_THEN_ERROR = new $$rsvp$node$$Result();

    function $$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        $$rsvp$node$$ERROR.value= error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        $$rsvp$node$$ERROR.value = error;
        return $$rsvp$node$$ERROR;
      }
    }

    function $$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function $$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function $$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    var $$rsvp$node$$default = function denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = $$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === $$rsvp$node$$GET_THEN_ERROR) {
              var p = new $$rsvp$promise$$default($$$internal$$noop);
              $$$internal$$reject(p, $$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = $$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new $$rsvp$promise$$default($$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            $$$internal$$reject(promise, err);
          else if (options === undefined)
            $$$internal$$resolve(promise, val);
          else if (options === true)
            $$$internal$$resolve(promise, $$rsvp$node$$arrayResult(arguments));
          else if ($$utils$$isArray(options))
            $$$internal$$resolve(promise, $$rsvp$node$$makeObject(arguments, options));
          else
            $$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    };

    function $$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === $$rsvp$node$$ERROR) {
        $$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function $$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return $$rsvp$promise$$default.all(args).then(function(args){
        var result = $$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === $$rsvp$node$$ERROR) {
          $$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function $$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === $$rsvp$promise$$default) {
          return true;
        } else {
          return $$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }

    var $$rsvp$all$$default = function all(array, label) {
      return $$rsvp$promise$$default.all(array, label);
    };

    function $$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    $$rsvp$all$settled$$AllSettled.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$rsvp$all$settled$$AllSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$all$settled$$AllSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    var $$rsvp$all$settled$$default = function allSettled(entries, label) {
      return new $$rsvp$all$settled$$AllSettled($$rsvp$promise$$default, entries, label).promise;
    };

    var $$rsvp$race$$default = function race(array, label) {
      return $$rsvp$promise$$default.race(array, label);
    };

    function $$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var $$promise$hash$$default = $$promise$hash$$PromiseHash;
    $$promise$hash$$PromiseHash.prototype = $$utils$$o_create($$enumerator$$default.prototype);
    $$promise$hash$$PromiseHash.prototype._superConstructor = $$enumerator$$default;

    $$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    $$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    $$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    $$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var promise = this.promise;
      var input   = this._input;
      var results = [];

      for (var key in input) {
        if (promise._state === $$$internal$$PENDING && input.hasOwnProperty(key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      this._remaining = length;
      var result;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        result = results[i];
        this._eachEntry(result.entry, result.position);
      }
    };

    var $$rsvp$hash$$default = function hash(object, label) {
      return new $$promise$hash$$default($$rsvp$promise$$default, object, label).promise;
    };

    function $$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    $$rsvp$hash$settled$$HashSettled.prototype = $$utils$$o_create($$promise$hash$$default.prototype);
    $$rsvp$hash$settled$$HashSettled.prototype._superConstructor = $$enumerator$$default;
    $$rsvp$hash$settled$$HashSettled.prototype._makeResult = $$enumerator$$makeSettledResult;

    $$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    var $$rsvp$hash$settled$$default = function hashSettled(object, label) {
      return new $$rsvp$hash$settled$$HashSettled($$rsvp$promise$$default, object, label).promise;
    };

    var $$rsvp$rethrow$$default = function rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    };

    var $$rsvp$defer$$default = function defer(label) {
      var deferred = { };

      deferred.promise = new $$rsvp$promise$$default(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      }, label);

      return deferred;
    };

    var $$rsvp$map$$default = function map(promises, mapFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return $$rsvp$promise$$default.all(results, label);
      });
    };

    var $$rsvp$resolve$$default = function resolve(value, label) {
      return $$rsvp$promise$$default.resolve(value, label);
    };

    var $$rsvp$reject$$default = function reject(reason, label) {
      return $$rsvp$promise$$default.reject(reason, label);
    };

    var $$rsvp$filter$$default = function filter(promises, filterFn, label) {
      return $$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!$$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return $$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    };

    var $$rsvp$asap$$len = 0;

    var $$rsvp$asap$$default = function asap(callback, arg) {
      $$rsvp$asap$$queue[$$rsvp$asap$$len] = callback;
      $$rsvp$asap$$queue[$$rsvp$asap$$len + 1] = arg;
      $$rsvp$asap$$len += 2;
      if ($$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$rsvp$asap$$scheduleFlush();
      }
    };

    var $$rsvp$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$rsvp$asap$$BrowserMutationObserver = $$rsvp$asap$$browserGlobal.MutationObserver || $$rsvp$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$rsvp$asap$$useNextTick() {
      return function() {
        process.nextTick($$rsvp$asap$$flush);
      };
    }

    function $$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$rsvp$asap$$BrowserMutationObserver($$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout($$rsvp$asap$$flush, 1);
      };
    }

    var $$rsvp$asap$$queue = new Array(1000);

    function $$rsvp$asap$$flush() {
      for (var i = 0; i < $$rsvp$asap$$len; i+=2) {
        var callback = $$rsvp$asap$$queue[i];
        var arg = $$rsvp$asap$$queue[i+1];

        callback(arg);

        $$rsvp$asap$$queue[i] = undefined;
        $$rsvp$asap$$queue[i+1] = undefined;
      }

      $$rsvp$asap$$len = 0;
    }

    var $$rsvp$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useNextTick();
    } else if ($$rsvp$asap$$BrowserMutationObserver) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMutationObserver();
    } else if ($$rsvp$asap$$isWorker) {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useMessageChannel();
    } else {
      $$rsvp$asap$$scheduleFlush = $$rsvp$asap$$useSetTimeout();
    }

    // default async is asap;
    $$rsvp$config$$config.async = $$rsvp$asap$$default;

    var $$rsvp$$cast = $$rsvp$resolve$$default;

    function $$rsvp$$async(callback, arg) {
      $$rsvp$config$$config.async(callback, arg);
    }

    function $$rsvp$$on() {
      $$rsvp$config$$config.on.apply($$rsvp$config$$config, arguments);
    }

    function $$rsvp$$off() {
      $$rsvp$config$$config.off.apply($$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var $$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      $$rsvp$config$$configure('instrument', true);
      for (var $$rsvp$$eventName in $$rsvp$$callbacks) {
        if ($$rsvp$$callbacks.hasOwnProperty($$rsvp$$eventName)) {
          $$rsvp$$on($$rsvp$$eventName, $$rsvp$$callbacks[$$rsvp$$eventName]);
        }
      }
    }

    var rsvp$umd$$RSVP = {
      'race': $$rsvp$race$$default,
      'Promise': $$rsvp$promise$$default,
      'allSettled': $$rsvp$all$settled$$default,
      'hash': $$rsvp$hash$$default,
      'hashSettled': $$rsvp$hash$settled$$default,
      'denodeify': $$rsvp$node$$default,
      'on': $$rsvp$$on,
      'off': $$rsvp$$off,
      'map': $$rsvp$map$$default,
      'filter': $$rsvp$filter$$default,
      'resolve': $$rsvp$resolve$$default,
      'reject': $$rsvp$reject$$default,
      'all': $$rsvp$all$$default,
      'rethrow': $$rsvp$rethrow$$default,
      'defer': $$rsvp$defer$$default,
      'EventTarget': $$rsvp$events$$default,
      'configure': $$rsvp$config$$configure,
      'async': $$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define.amd) {
      define(function() { return rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = rsvp$umd$$RSVP;
    } else if (typeof this !== 'undefined') {
      this['RSVP'] = rsvp$umd$$RSVP;
    }
}).call(this);
define('rsvp', [], function(){
  return RSVP;
});

/*
 Version: core-1.0
 The MIT License: Copyright (c) 2012 LiosK.
*/
function UUID(){}UUID.generate=function(){var a=UUID._gri,b=UUID._ha;return b(a(32),8)+"-"+b(a(16),4)+"-"+b(16384|a(12),4)+"-"+b(32768|a(14),4)+"-"+b(a(48),12)};UUID._gri=function(a){return 0>a?NaN:30>=a?0|Math.random()*(1<<a):53>=a?(0|1073741824*Math.random())+1073741824*(0|Math.random()*(1<<a-30)):NaN};UUID._ha=function(a,b){for(var c=a.toString(16),d=b-c.length,e="0";0<d;d>>>=1,e+=e)d&1&&(c=e+c);return c};

/*! Kamino v0.0.1 | http://github.com/Cyril-sf/kamino.js | Copyright 2012, Kit Cambridge | http://kit.mit-license.org */
(function(window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  Kamino = {};
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Kamino;
    }
    exports.Kamino = Kamino;
  } else {
    window['Kamino'] = Kamino;
  }

  Kamino.VERSION = '0.1.0';

  KaminoException = function() {
    this.name = "KaminoException";
    this.number = 25;
    this.message = "Uncaught Error: DATA_CLONE_ERR: Kamino Exception 25";
  };

  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() == 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // IE <= 7 doesn't support accessing string characters using square
  // bracket notation. IE 8 only supports this for primitives.
  var charIndexBuggy = "A"[0] != "A";

  // Define additional utility methods if the `Date` methods are buggy.
  if (!isExtended) {
    var floor = Math.floor;
    // A mapping between the months of the year and the number of days between
    // January 1st and the first of the respective month.
    var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    // Internal: Calculates the number of days between the Unix epoch and the
    // first day of the given month.
    var getDay = function (year, month) {
      return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
    };
  }

  // Internal: Determines if a property is a direct property of the given
  // object. Delegates to the native `Object#hasOwnProperty` method.
  if (!(isProperty = {}.hasOwnProperty)) {
    isProperty = function (property) {
      var members = {}, constructor;
      if ((members.__proto__ = null, members.__proto__ = {
        // The *proto* property cannot be set multiple times in recent
        // versions of Firefox and SeaMonkey.
        "toString": 1
      }, members).toString != getClass) {
        // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
        // supports the mutable *proto* property.
        isProperty = function (property) {
          // Capture and break the object's prototype chain (see section 8.6.2
          // of the ES 5.1 spec). The parenthesized expression prevents an
          // unsafe transformation by the Closure Compiler.
          var original = this.__proto__, result = property in (this.__proto__ = null, this);
          // Restore the original prototype chain.
          this.__proto__ = original;
          return result;
        };
      } else {
        // Capture a reference to the top-level `Object` constructor.
        constructor = members.constructor;
        // Use the `constructor` property to simulate `Object#hasOwnProperty` in
        // other environments.
        isProperty = function (property) {
          var parent = (this.constructor || constructor).prototype;
          return property in this && !(property in parent && this[property] === parent[property]);
        };
      }
      members = null;
      return isProperty.call(this, property);
    };
  }

  // Internal: Normalizes the `for...in` iteration algorithm across
  // environments. Each enumerated key is yielded to a `callback` function.
  forEach = function (object, callback) {
    var size = 0, Properties, members, property, forEach;

    // Tests for bugs in the current environment's `for...in` algorithm. The
    // `valueOf` property inherits the non-enumerable flag from
    // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
    (Properties = function () {
      this.valueOf = 0;
    }).prototype.valueOf = 0;

    // Iterate over a new instance of the `Properties` class.
    members = new Properties();
    for (property in members) {
      // Ignore all properties inherited from `Object.prototype`.
      if (isProperty.call(members, property)) {
        size++;
      }
    }
    Properties = members = null;

    // Normalize the iteration algorithm.
    if (!size) {
      // A list of non-enumerable properties inherited from `Object.prototype`.
      members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
      // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
      // properties.
      forEach = function (object, callback) {
        var isFunction = getClass.call(object) == "[object Function]", property, length;
        for (property in object) {
          // Gecko <= 1.0 enumerates the `prototype` property of functions under
          // certain conditions; IE does not.
          if (!(isFunction && property == "prototype") && isProperty.call(object, property)) {
            callback(property);
          }
        }
        // Manually invoke the callback for each non-enumerable property.
        for (length = members.length; property = members[--length]; isProperty.call(object, property) && callback(property));
      };
    } else if (size == 2) {
      // Safari <= 2.0.4 enumerates shadowed properties twice.
      forEach = function (object, callback) {
        // Create a set of iterated properties.
        var members = {}, isFunction = getClass.call(object) == "[object Function]", property;
        for (property in object) {
          // Store each property name to prevent double enumeration. The
          // `prototype` property of functions is not enumerated due to cross-
          // environment inconsistencies.
          if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
            callback(property);
          }
        }
      };
    } else {
      // No bugs detected; use the standard `for...in` algorithm.
      forEach = function (object, callback) {
        var isFunction = getClass.call(object) == "[object Function]", property, isConstructor;
        for (property in object) {
          if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
            callback(property);
          }
        }
        // Manually invoke the callback for the `constructor` property due to
        // cross-environment inconsistencies.
        if (isConstructor || isProperty.call(object, (property = "constructor"))) {
          callback(property);
        }
      };
    }
    return forEach(object, callback);
  };

  // Public: Serializes a JavaScript `value` as a string. The optional
  // `filter` argument may specify either a function that alters how object and
  // array members are serialized, or an array of strings and numbers that
  // indicates which properties should be serialized. The optional `width`
  // argument may be either a string or number that specifies the indentation
  // level of the output.

  // Internal: A map of control characters and their escaped equivalents.
  var Escapes = {
    "\\": "\\\\",
    '"': '\\"',
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t"
  };

  // Internal: Converts `value` into a zero-padded string such that its
  // length is at least equal to `width`. The `width` must be <= 6.
  var toPaddedString = function (width, value) {
    // The `|| 0` expression is necessary to work around a bug in
    // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
    return ("000000" + (value || 0)).slice(-width);
  };

  // Internal: Double-quotes a string `value`, replacing all ASCII control
  // characters (characters with code unit values between 0 and 31) with
  // their escaped equivalents. This is an implementation of the
  // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
  var quote = function (value) {
    var result = '"', index = 0, symbol;
    for (; symbol = value.charAt(index); index++) {
      // Escape the reverse solidus, double quote, backspace, form feed, line
      // feed, carriage return, and tab characters.
      result += '\\"\b\f\n\r\t'.indexOf(symbol) > -1 ? Escapes[symbol] :
        // If the character is a control character, append its Unicode escape
        // sequence; otherwise, append the character as-is.
        (Escapes[symbol] = symbol < " " ? "\\u00" + toPaddedString(2, symbol.charCodeAt(0).toString(16)) : symbol);
    }
    return result + '"';
  };

  // Internal: detects if an object is a DOM element.
  // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  var isElement = function(o) {
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
    );
  };

  // Internal: Recursively serializes an object. Implements the
  // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
  var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
    var value = object[property], originalClassName, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, any, result,
        regExpSource, regExpModifiers = "";
    if( value instanceof Error || value instanceof Function) {
      throw new KaminoException();
    }
    if( isElement( value ) ) {
      throw new KaminoException();
    }
    if (typeof value == "object" && value) {
      originalClassName = getClass.call(value);
      if (originalClassName == "[object Date]" && !isProperty.call(value, "toJSON")) {
        if (value > -1 / 0 && value < 1 / 0) {
          value = value.toUTCString().replace("GMT", "UTC");
        } else {
          value = null;
        }
      } else if (typeof value.toJSON == "function" && ((originalClassName != "[object Number]" && originalClassName != "[object String]" && originalClassName != "[object Array]") || isProperty.call(value, "toJSON"))) {
        // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
        // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
        // ignores all `toJSON` methods on these objects unless they are
        // defined directly on an instance.
        value = value.toJSON(property);
      }
    }
    if (callback) {
      // If a replacement function was provided, call it to obtain the value
      // for serialization.
      value = callback.call(object, property, value);
    }
    if (value === null) {
      return "null";
    }
    if (value === undefined) {
      return undefined;
    }
    className = getClass.call(value);
    if (className == "[object Boolean]") {
      // Booleans are represented literally.
      return "" + value;
    } else if (className == "[object Number]") {
      // Kamino numbers must be finite. `Infinity` and `NaN` are serialized as
      // `"null"`.
      if( value === Number.POSITIVE_INFINITY ) {
        return "Infinity";
      } else if( value === Number.NEGATIVE_INFINITY ) {
        return "NInfinity";
      } else if( isNaN( value ) ) {
        return "NaN";
      }
      return "" + value;
    } else if (className == "[object RegExp]") {
      // Strings are double-quoted and escaped.
      regExpSource = value.source;
      regExpModifiers += value.ignoreCase ? "i" : "";
      regExpModifiers += value.global ? "g" : "";
      regExpModifiers += value.multiline ? "m" : "";

      regExpSource = quote(charIndexBuggy ? regExpSource.split("") : regExpSource);
      regExpModifiers = quote(charIndexBuggy ? regExpModifiers.split("") : regExpModifiers);

      // Adds the RegExp prefix.
      value = '^' + regExpSource + regExpModifiers;

      return value;
    } else if (className == "[object String]") {
      // Strings are double-quoted and escaped.
      value = quote(charIndexBuggy ? value.split("") : value);

      if( originalClassName == "[object Date]") {
        // Adds the Date prefix.
        value = '%' + value;
      }

      return value;
    }
    // Recursively serialize objects and arrays.
    if (typeof value == "object") {
      // Check for cyclic structures. This is a linear search; performance
      // is inversely proportional to the number of unique nested objects.
      for (length = stack.length; length--;) {
        if (stack[length] === value) {
          return "&" + length;
        }
      }
      // Add the object to the stack of traversed objects.
      stack.push(value);
      results = [];
      // Save the current indentation level and indent one additional level.
      prefix = indentation;
      indentation += whitespace;
      if (className == "[object Array]") {
        // Recursively serialize array elements.
        for (index = 0, length = value.length; index < length; any || (any = true), index++) {
          element = serialize(index, value, callback, properties, whitespace, indentation, stack);
          results.push(element === undef ? "null" : element);
        }
        result = any ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
      } else {
        // Recursively serialize object members. Members are selected from
        // either a user-specified list of property names, or the object
        // itself.
        forEach(properties || value, function (property) {
          var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
          if (element !== undef) {
            // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
            // is not the empty string, let `member` {quote(property) + ":"}
            // be the concatenation of `member` and the `space` character."
            // The "`space` character" refers to the literal space
            // character, not the `space` {width} argument provided to
            // `JSON.stringify`.
            results.push(quote(charIndexBuggy ? property.split("") : property) + ":" + (whitespace ? " " : "") + element);
          }
          any || (any = true);
        });
        result = any ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
      }
      return result;
    }
  };

  // Public: `Kamino.stringify`. See ES 5.1 section 15.12.3.
  Kamino.stringify = function (source, filter, width) {
    var whitespace, callback, properties;
    if (typeof filter == "function" || typeof filter == "object" && filter) {
      if (getClass.call(filter) == "[object Function]") {
        callback = filter;
      } else if (getClass.call(filter) == "[object Array]") {
        // Convert the property names array into a makeshift set.
        properties = {};
        for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((getClass.call(value) == "[object String]" || getClass.call(value) == "[object Number]") && (properties[value] = 1)));
      }
    }
    if (width) {
      if (getClass.call(width) == "[object Number]") {
        // Convert the `width` to an integer and create a string containing
        // `width` number of space characters.
        if ((width -= width % 1) > 0) {
          for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
        }
      } else if (getClass.call(width) == "[object String]") {
        whitespace = width.length <= 10 ? width : width.slice(0, 10);
      }
    }
    // Opera <= 7.54u2 discards the values associated with empty string keys
    // (`""`) only if they are used directly within an object member list
    // (e.g., `!("" in { "": 1})`).
    return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
  };

  // Public: Parses a source string.
  var fromCharCode = String.fromCharCode;

  // Internal: A map of escaped control characters and their unescaped
  // equivalents.
  var Unescapes = {
    "\\": "\\",
    '"': '"',
    "/": "/",
    "b": "\b",
    "t": "\t",
    "n": "\n",
    "f": "\f",
    "r": "\r"
  };

  // Internal: Stores the parser state.
  var Index, Source, stack;

  // Internal: Resets the parser state and throws a `SyntaxError`.
  var abort = function() {
    Index = Source = null;
    throw SyntaxError();
  };

  var parseString = function(prefix) {
    prefix = prefix || "";
    var source = Source, length = source.length, value, symbol, begin, position;
    // Advance to the next character and parse a Kamino string at the
    // current position. String tokens are prefixed with the sentinel
    // `@` character to distinguish them from punctuators.
    for (value = prefix, Index++; Index < length;) {
      symbol = source[Index];
      if (symbol < " ") {
        // Unescaped ASCII control characters are not permitted.
        abort();
      } else if (symbol == "\\") {
        // Parse escaped Kamino control characters, `"`, `\`, `/`, and
        // Unicode escape sequences.
        symbol = source[++Index];
        if ('\\"/btnfr'.indexOf(symbol) > -1) {
          // Revive escaped control characters.
          value += Unescapes[symbol];
          Index++;
        } else if (symbol == "u") {
          // Advance to the first character of the escape sequence.
          begin = ++Index;
          // Validate the Unicode escape sequence.
          for (position = Index + 4; Index < position; Index++) {
            symbol = source[Index];
            // A valid sequence comprises four hexdigits that form a
            // single hexadecimal value.
            if (!(symbol >= "0" && symbol <= "9" || symbol >= "a" && symbol <= "f" || symbol >= "A" && symbol <= "F")) {
              // Invalid Unicode escape sequence.
              abort();
            }
          }
          // Revive the escaped character.
          value += fromCharCode("0x" + source.slice(begin, Index));
        } else {
          // Invalid escape sequence.
          abort();
        }
      } else {
        if (symbol == '"') {
          // An unescaped double-quote character marks the end of the
          // string.
          break;
        }
        // Append the original character as-is.
        value += symbol;
        Index++;
      }
    }
    if (source[Index] == '"') {
      Index++;
      // Return the revived string.
      return value;
    }
    // Unterminated string.
    abort();
  };

  // Internal: Returns the next token, or `"$"` if the parser has reached
  // the end of the source string. A token may be a string, number, `null`
  // literal, `NaN` literal or Boolean literal.
  var lex = function () {
    var source = Source, length = source.length, symbol, value, begin, position, sign,
        dateString, regExpSource, regExpModifiers;
    while (Index < length) {
      symbol = source[Index];
      if ("\t\r\n ".indexOf(symbol) > -1) {
        // Skip whitespace tokens, including tabs, carriage returns, line
        // feeds, and space characters.
        Index++;
      } else if ("{}[]:,".indexOf(symbol) > -1) {
        // Parse a punctuator token at the current position.
        Index++;
        return symbol;
      } else if (symbol == '"') {
        // Parse strings.
        return parseString("@");
      } else if (symbol == '%') {
        // Parse dates.
        Index++;
        symbol = source[Index];
        if(symbol == '"') {
          dateString = parseString();
          return new Date( dateString );
        }
        abort();
      } else if (symbol == '^') {
        // Parse regular expressions.
        Index++;
        symbol = source[Index];
        if(symbol == '"') {
          regExpSource = parseString();

          symbol = source[Index];
          if(symbol == '"') {
            regExpModifiers = parseString();

            return new RegExp( regExpSource, regExpModifiers );
          }
        }
        abort();
      } else if (symbol == '&') {
        // Parse object references.
        Index++;
        symbol = source[Index];
        if (symbol >= "0" && symbol <= "9") {
          Index++;
          return stack[symbol];
        }
        abort();
      } else {
        // Parse numbers and literals.
        begin = Index;
        // Advance the scanner's position past the sign, if one is
        // specified.
        if (symbol == "-") {
          sign = true;
          symbol = source[++Index];
        }
        // Parse an integer or floating-point value.
        if (symbol >= "0" && symbol <= "9") {
          // Leading zeroes are interpreted as octal literals.
          if (symbol == "0" && (symbol = source[Index + 1], symbol >= "0" && symbol <= "9")) {
            // Illegal octal literal.
            abort();
          }
          sign = false;
          // Parse the integer component.
          for (; Index < length && (symbol = source[Index], symbol >= "0" && symbol <= "9"); Index++);
          // Floats cannot contain a leading decimal point; however, this
          // case is already accounted for by the parser.
          if (source[Index] == ".") {
            position = ++Index;
            // Parse the decimal component.
            for (; position < length && (symbol = source[position], symbol >= "0" && symbol <= "9"); position++);
            if (position == Index) {
              // Illegal trailing decimal.
              abort();
            }
            Index = position;
          }
          // Parse exponents.
          symbol = source[Index];
          if (symbol == "e" || symbol == "E") {
            // Skip past the sign following the exponent, if one is
            // specified.
            symbol = source[++Index];
            if (symbol == "+" || symbol == "-") {
              Index++;
            }
            // Parse the exponential component.
            for (position = Index; position < length && (symbol = source[position], symbol >= "0" && symbol <= "9"); position++);
            if (position == Index) {
              // Illegal empty exponent.
              abort();
            }
            Index = position;
          }
          // Coerce the parsed value to a JavaScript number.
          return +source.slice(begin, Index);
        }
        // A negative sign may only precede numbers.
        if (sign) {
          abort();
        }
        // `true`, `false`, `Infinity`, `-Infinity`, `NaN` and `null` literals.
        if (source.slice(Index, Index + 4) == "true") {
          Index += 4;
          return true;
        } else if (source.slice(Index, Index + 5) == "false") {
          Index += 5;
          return false;
        } else if (source.slice(Index, Index + 8) == "Infinity") {
          Index += 8;
          return Infinity;
        } else if (source.slice(Index, Index + 9) == "NInfinity") {
          Index += 9;
          return -Infinity;
        } else if (source.slice(Index, Index + 3) == "NaN") {
          Index += 3;
          return NaN;
        } else if (source.slice(Index, Index + 4) == "null") {
          Index += 4;
          return null;
        }
        // Unrecognized token.
        abort();
      }
    }
    // Return the sentinel `$` character if the parser has reached the end
    // of the source string.
    return "$";
  };

  // Internal: Parses a Kamino `value` token.
  var get = function (value) {
    var results, any, key;
    if (value == "$") {
      // Unexpected end of input.
      abort();
    }
    if (typeof value == "string") {
      if (value[0] == "@") {
        // Remove the sentinel `@` character.
        return value.slice(1);
      }
      // Parse object and array literals.
      if (value == "[") {
        // Parses a Kamino array, returning a new JavaScript array.
        results = [];
        stack[stack.length] = results;
        for (;; any || (any = true)) {
          value = lex();
          // A closing square bracket marks the end of the array literal.
          if (value == "]") {
            break;
          }
          // If the array literal contains elements, the current token
          // should be a comma separating the previous element from the
          // next.
          if (any) {
            if (value == ",") {
              value = lex();
              if (value == "]") {
                // Unexpected trailing `,` in array literal.
                abort();
              }
            } else {
              // A `,` must separate each array element.
              abort();
            }
          }
          // Elisions and leading commas are not permitted.
          if (value == ",") {
            abort();
          }
          results.push(get(typeof value == "string" && charIndexBuggy ? value.split("") : value));
        }
        return results;
      } else if (value == "{") {
        // Parses a Kamino object, returning a new JavaScript object.
        results = {};
        stack[stack.length] = results;
        for (;; any || (any = true)) {
          value = lex();
          // A closing curly brace marks the end of the object literal.
          if (value == "}") {
            break;
          }
          // If the object literal contains members, the current token
          // should be a comma separator.
          if (any) {
            if (value == ",") {
              value = lex();
              if (value == "}") {
                // Unexpected trailing `,` in object literal.
                abort();
              }
            } else {
              // A `,` must separate each object member.
              abort();
            }
          }
          // Leading commas are not permitted, object property names must be
          // double-quoted strings, and a `:` must separate each property
          // name and value.
          if (value == "," || typeof value != "string" || value[0] != "@" || lex() != ":") {
            abort();
          }
          var result = lex();
          results[value.slice(1)] = get(typeof result == "string" && charIndexBuggy ? result.split("") : result);
        }
        return results;
      }
      // Unexpected token encountered.
      abort();
    }
    return value;
  };

  // Internal: Updates a traversed object member.
  var update = function(source, property, callback) {
    var element = walk(source, property, callback);
    if (element === undef) {
      delete source[property];
    } else {
      source[property] = element;
    }
  };

  // Internal: Recursively traverses a parsed Kamino object, invoking the
  // `callback` function for each value. This is an implementation of the
  // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
  var walk = function (source, property, callback) {
    var value = source[property], length;
    if (typeof value == "object" && value) {
      if (getClass.call(value) == "[object Array]") {
        for (length = value.length; length--;) {
          update(value, length, callback);
        }
      } else {
        // `forEach` can't be used to traverse an array in Opera <= 8.54,
        // as `Object#hasOwnProperty` returns `false` for array indices
        // (e.g., `![1, 2, 3].hasOwnProperty("0")`).
        forEach(value, function (property) {
          update(value, property, callback);
        });
      }
    }
    return callback.call(source, property, value);
  };

  // Public: `Kamino.parse`. See ES 5.1 section 15.12.2.
  Kamino.parse = function (source, callback) {
    var result, value;
    Index = 0;
    Source = "" + source;
    stack = [];
    if (charIndexBuggy) {
      Source = source.split("");
    }
    result = get(lex());
    // If a Kamino string contains multiple tokens, it is invalid.
    if (lex() != "$") {
      abort();
    }
    // Reset the parser state.
    Index = Source = null;
    return callback && getClass.call(callback) == "[object Function]" ? walk((value = {}, value[""] = result, value), "", callback) : result;
  };

  Kamino.clone = function(source) {
    return Kamino.parse( Kamino.stringify(source) );
  };
})(this);

(function(root) {
  var self = root,
      Window = self.Window,
      usePoly = false,
      a_slice = [].slice;

  function isFunction(functionToCheck) {
    return functionToCheck && Object.prototype.toString.call(functionToCheck) === '[object Function]';
  }

  function isInWorker() {
    return  typeof Worker === 'undefined' && typeof Window === 'undefined';
  }

  if( usePoly || !self.MessageChannel ) {

    var isWindowToWindowMessage = function( currentTarget ) {
          return typeof window !== "undefined" && self instanceof Window && ( !isFunction(self.Worker) || !(currentTarget instanceof Worker) );
        },
        log = function( message ) {
          if (MessageChannel.verbose) {
            var args = a_slice.apply(arguments);
            args.unshift("MCNP: ");
            console.log.apply(console, args);
          }
        },
        messagePorts = {};

    var MessagePort = self.MessagePort = function( uuid ) {
      this._entangledPortUuid = null;
      this.destinationUrl = null;
      this._listeners = {};
      this._messageQueue = [];
      this._messageQueueEnabled = false;
      this._currentTarget = null;

      this.uuid = uuid || UUID.generate();
      messagePorts[this.uuid] = this;
      this.log("created");
    };

    MessagePort.prototype = {
      start: function() {
        var event,
            self = this;

        // TODO: we have no guarantee that
        // we will not receive and process events in the correct order
        setTimeout( function() {
          self.log('draining ' + self._messageQueue.length + ' queued messages');
          while( self._messageQueueEnabled && (event = self._messageQueue.shift()) ) {
            self.dispatchEvent( event );
          }
        });
        this._messageQueueEnabled = true;
        this.log('started');
      },

      close: function() {
        this._messageQueueEnabled = false;
        if( this._entangledPortUuid ) {
          this._getEntangledPort()._entangledPortUuid = null;
          this._entangledPortUuid = null;

          // /!\ Probably need to send that (?)
        }
      },

      postMessage: function( message ) {
        // Numbers refer to step from the W3C specs. It shows how simplified things are
        // 1- Let target port be the port with which source port is entangled, if any
        var target = this._getEntangledPort(),
            currentTarget = this._currentTarget,
            messageClone;


        // 8- If there is no target port (i.e. if source port is not entangled), then abort these steps.
        if(!target) {
          this.log("not entangled, discarding message", message);
          return;
        }

        // 12- Add the event to the port message queue of target port.
        // As the port is cloned when sent to the other user agent,
        // posting a message can mean different things:
        // * The port is still local, then we need to queue the event
        // * the port has been sent, then we need to send that event
        if( currentTarget ) {
          // 5- Let message clone be the result of obtaining a structured clone of the message argument
          messageClone = MessageChannel.encodeEvent( message, [target], true );

          if( isWindowToWindowMessage( currentTarget ) ) {
            this.log("posting message from window to window", message, this.destinationUrl);
            currentTarget.postMessage(messageClone, this.destinationUrl);
          } else {
            this.log("posting message from or to worker", message);
            currentTarget.postMessage(messageClone);
          }
        } else {
          this.log("not connected, queueing message", message);
          target._enqueueEvent(MessageChannel._messageEvent(message, [target], true));
        }
      },

      addEventListener: function( type, listener ) {
        if (typeof this._listeners[type] === "undefined"){
          this._listeners[type] = [];
        }

        this._listeners[type].push( listener );
      },

      removeEventListener: function( type, listener) {
        if (this._listeners[type] instanceof Array){
          var listeners = this._listeners[type];
          for (var i=0; i < listeners.length; i++){
            if (listeners[i] === listener){
              listeners.splice(i, 1);
              break;
            }
          }
        }
      },

      dispatchEvent: function( event ) {
        var listeners = this._listeners.message;
        if( listeners ) {
          for (var i=0; i < listeners.length; i++){
            listeners[i].call(this, event);
          }
        }
      },

      _enqueueEvent: function( event ) {
        if(this._messageQueueEnabled) {
          this.dispatchEvent( event );
        } else {
          this._messageQueue.push( event );
        }
      },

      _getPort: function( portClone, messageEvent, copyEvents ) {
        var loadPort = function(uuid) {
          var port = messagePorts[uuid] || MessageChannel._createPort(uuid);
          return port;
        };

        var port = loadPort(portClone.uuid);
        port._entangledPortUuid = portClone._entangledPortUuid;
        port._getEntangledPort()._entangledPortUuid = port.uuid;
        port._currentTarget =  messageEvent.source || messageEvent.currentTarget || self;
        if( messageEvent.origin === "null" ) {
          port.destinationUrl = "*";
        } else {
          port.destinationUrl = messageEvent.origin;
        }

        if( copyEvents ) {
          for( var i=0 ; i < portClone._messageQueue.length ; i++ ) {
            port._messageQueue.push( portClone._messageQueue[i] );
          }
        }

        return port;
      },

      _getEntangledPort: function() {
        if( this._entangledPortUuid ) {
          return messagePorts[ this._entangledPortUuid ] || MessageChannel._createPort(this._entangledPortUuid);
        } else {
          return null;
        }
      },

      log: function () {
        if (MessageChannel.verbose) {
          var args = a_slice.apply(arguments);
          args.unshift("Port", this.uuid);
          log.apply(null, args);
        }
      }
    };

    var MessageChannel = self.MessageChannel = function () {
      var port1 = MessageChannel._createPort(),
          port2 = MessageChannel._createPort(),
          channel;

      port1._entangledPortUuid = port2.uuid;
      port2._entangledPortUuid = port1.uuid;

      channel = {
        port1: port1,
        port2: port2
      };

      MessageChannel.log(channel, "created");

      return channel;
    };

    MessageChannel.log = function (_channel) {
      if (MessageChannel.verbose) {
        var args = ["Chnl"],
            msgArgs = a_slice.call(arguments, 1);

        if (_channel.port1 && _channel.port2) {
          args.push(_channel.port1.uuid, _channel.port2.uuid);
        } else {
          _channel.forEach( function(channel) {
            args.push(channel._entangledPortUuid);
          });
        }

        args.push.apply(args, msgArgs);
        log.apply(null, args);
      }
    };

    MessageChannel._createPort = function() {
      var args = arguments,
          MessagePortConstructor = function() {
            return MessagePort.apply(this, args);
          };

      MessagePortConstructor.prototype = MessagePort.prototype;

      return new MessagePortConstructor();
    };

    /**
        Encode the event to be sent.

        messageEvent.data contains a fake Event encoded with Kamino.js

        It contains:
        * data: the content that the MessagePort should send
        * ports: The targeted MessagePorts.
        * messageChannel: this allows to decide if the MessageEvent was meant for the window or the port

        @param {Object} data
        @param {Array} ports
        @param {Boolean} messageChannel
        @returns {String} a string representation of the data to be sent
    */
    MessageChannel.encodeEvent = function( data, ports, messageChannel ) {
      var strippedPorts = new Array(ports.length),
          encodedMessage, messageEvent;

      for (var i = 0; i < ports.length; ++i) {
        strippedPorts[i] = MessageChannel._strippedPort(ports[i]);
      }

      messageEvent = { event: MessageChannel._messageEvent(data, strippedPorts, messageChannel) };
      encodedMessage = Kamino.stringify(messageEvent);

      return encodedMessage;
    };

    MessageChannel._messageEvent = function(data, ports, messageChannel) {
      return  { data: data, ports: ports, messageChannel: messageChannel};
    };

    MessageChannel._strippedPort = function (port) {
      if (!port) { return; }

      var messageQueue = [];
      for (var msg, msgPorts, ports, i = 0; i < port._messageQueue.length; ++i) {
        msg = port._messageQueue[i];
        msgPorts = msg.ports || [];
        ports = [];

        for (var portRef, j = 0; j < msgPorts.length; ++j) {
          portRef = msgPorts[j];
          ports.push({
            uuid: portRef.uuid,
            _entangledPortUuid: portRef._entangledPortUuid
          });
        }
        messageQueue.push({
          data: msg.data,
          messageChannel: msg.messageChannel,
          ports: ports
        });
      }

      return {
        uuid: port.uuid,
        _entangledPortUuid: port._entangledPortUuid,
        _messageQueue: messageQueue
      };
    };

    /**
        Extract the event from the message.

        messageEvent.data contains a fake Event encoded with Kamino.js

        It contains:
        * data: the content that the MessagePort should use
        * ports: The targeted MessagePorts.
        * messageChannel: this allows to decide if the MessageEvent was meant for the window or the port

        @param {MessageEvent} messageEvent
        @param {Boolean} copyEvents: copy or not the events from the cloned port to the local one
        @returns {Object} an object that fakes an event with limited attributes ( data, ports )
    */
    MessageChannel.decodeEvent = function( messageEvent, copyEvents ) {
      var fakeEvent = {
            data: null,
            ports: []
          },
          data = Kamino.parse( messageEvent.data ),
          event = data.event,
          ports = event.ports;

      if( event ) {
        if( ports ) {
          for(var i=0; i< ports.length ; i++) {
            fakeEvent.ports.push( MessagePort.prototype._getPort( ports[i], messageEvent, copyEvents ) );
          }
        }
        fakeEvent.data = event.data;
        fakeEvent.source = messageEvent.source;
        fakeEvent.messageChannel = event.messageChannel;
      }

      return fakeEvent;
    };

    /**
        Extract the event from the message if possible.

        A user agent can received events that are not encoded using Kamino.

        @param {MessageEvent} messageEvent
        @param {Boolean} copyEvents: copy or not the events from the cloned port to the local one
        @returns {Object} an object that fakes an event or the triggered event
    */
    var decodeEvent = function( event, copyEvents ) {
      var messageEvent;

      try {
        messageEvent = MessageChannel.decodeEvent( event, copyEvents );
      } catch( e ) {
        if( e instanceof SyntaxError ) {
          messageEvent = event;
        } else {
          throw e;
        }
      }

      return messageEvent;
    };

    var propagationHandler = function( event ) {
      var messageEvent = decodeEvent( event, true );

      if( messageEvent.messageChannel ) {
        MessageChannel.propagateEvent( messageEvent );
      }
    };

    // Add the default message event handler
    // This is useful so that a user agent can pass ports
    // without declaring any event handler.
    //
    // This handler takes care of copying the events queue passed with a port.
    // We only need to perform this when passing a port between user agents,
    // otherwise the event is passed through `postMessage` and not through the queue
    // and is handled by the port's message listener.
    //
    // Ex:
    //    iFrame1 - iFrame2 - iFrame3
    //    iFrame2 creates a MessageChannel and passes a port to each iframe
    //    we need a default handler to receive MessagePorts' events
    //    and to propagate them
    var _addMessagePortEventHandler = function( target ) {
      if( target.addEventListener ) {
        target.addEventListener( 'message', propagationHandler, false );
      } else if( target.attachEvent ) {
        target.attachEvent( 'onmessage', propagationHandler );
      }
    };

    var _overrideMessageEventListener = function( target ) {
      var originalAddEventListener, addEventListenerName,
          targetRemoveEventListener, removeEventListenerName,
          messageEventType,
          messageHandlers = [];

      if( target.addEventListener ) {
        addEventListenerName = 'addEventListener';
        removeEventListenerName = 'removeEventListener';
        messageEventType = 'message';
      } else if( target.attachEvent ) {
        addEventListenerName = 'attachEvent';
        removeEventListenerName = 'detachEvent';
        messageEventType = 'onmessage';
      }
      originalAddEventListener = target[addEventListenerName];
      targetRemoveEventListener = target[removeEventListenerName];

      target[addEventListenerName] = function() {
        var args = Array.prototype.slice.call( arguments ),
            originalHandler = args[1],
            self = this,
            messageHandlerWrapper;

        if( args[0] === messageEventType ) {
          messageHandlerWrapper = function( event ) {
            var messageEvent = decodeEvent( event );

            if( ! messageEvent.messageChannel ) {
              originalHandler.call( self, messageEvent );
            }
          };
          originalHandler.messageHandlerWrapper = messageHandlerWrapper;

          args[1] = messageHandlerWrapper;
        }

        originalAddEventListener.apply( this, args );
      };

      target[removeEventListenerName] = function() {
        var args = Array.prototype.slice.call( arguments ),
            originalHandler = args[1];

        if( args[0] === messageEventType ) {
          args[1] = originalHandler.messageHandlerWrapper;
          delete originalHandler.messageHandlerWrapper;
        }

        if( args[1] ) {
          targetRemoveEventListener.apply( this, args );
        }
      };
    };


    /**
        Send the event to the targeted ports

        It uses the `messageChannel` attribute to decide
        if the event is meant for the window or MessagePorts

        @param {Object} fakeEvent
    */
    MessageChannel.propagateEvent = function( fakeEvent ) {
      var ports, port, entangledPort;

      if( fakeEvent.messageChannel ) {
        ports = fakeEvent.ports;

        for( var i=0 ; i<ports.length ; i++) {
          port = ports[i];
          entangledPort = port._getEntangledPort();

          if( port._currentTarget && entangledPort._currentTarget ) {
            entangledPort.postMessage( fakeEvent.data );
          } else {
            port._enqueueEvent( fakeEvent );
          }
        }
      }
    };

    MessageChannel.reset = function() {
      messagePorts = {};
    };

    //
    _addMessagePortEventHandler( self );

    /**
        Send the MessagePorts to the other window

        `window.postMessage` doesn't accept fake ports so we have to encode them
        and pass them in the message.

        @param {Object} otherWindow: A reference to another window.
        @param {Object} message: Data to be sent to the other window.
        @param {String} targetOrigin: Specifies what the origin of otherWindow must be for the event to be dispatched.
        @param {Array} ports: MessagePorts that need to be sent to otherWindow.
    */
    if( Window ) {
      Window.postMessage = function( otherWindow, message, targetOrigin, ports ) {
        var data, entangledPort;

        // Internet Explorer requires the `ports` parameter
        ports = ports || [];

        data = MessageChannel.encodeEvent( message, ports, false );

        if( ports ) {
          // We need to know if a port has been sent to another user agent
          // to decide when to queue and when to send messages
          // See `MessageChannel.propagateEvent`
          for( var i=0 ; i<ports.length ; i++) {
            entangledPort = ports[i]._getEntangledPort();
            if( !entangledPort._currentTarget ) {
              entangledPort._currentTarget = otherWindow;
              entangledPort.destinationUrl = targetOrigin;
            }
          }
        }

        MessageChannel.log(ports, "handshake window", otherWindow);
        otherWindow.postMessage(data, targetOrigin);
      };

      // Juggling to find where to override `addEventListener`
      // Firefox 30.0a1 (2014-02-17) adds `addEventListener` on the global object
      // Internet Explorer doesn't allow to override `window.attachEvent`
      var target;
      if( window.addEventListener ) {
        target = window;
      } else if( window.attachEvent ) {
        target = Window.prototype;
      } else {
        throw "We couldn't find a method to attach an event handler.";
      }

      _overrideMessageEventListener( target );
    } else {
      //Worker
      _overrideMessageEventListener( self );
    }

    if( self.Worker ) {
      var OriginalWorker = Worker,
          originalAddEventListener;

      if( OriginalWorker.prototype.addEventListener ) {
        originalAddEventListener = OriginalWorker.prototype.addEventListener;
      } else if( OriginalWorker.prototype.attachEvent ) {
        originalAddEventListener = OriginalWorker.prototype.attachEvent;
      }

      self.Worker = function() {
        var worker = new OriginalWorker(arguments[0]),
            _addEventListener = originalAddEventListener;

        _addEventListener.call(worker, 'message', propagationHandler);

        return worker;
      };
      Worker.prototype = OriginalWorker.prototype;

      _overrideMessageEventListener( Worker.prototype );

    } else if (isInWorker()) {
      self.Worker = { };
    }

    if (self.Worker) {
      self.Worker.postMessage = function( worker, message, transferList )  {
        var data = MessageChannel.encodeEvent( message, transferList, false ),
            entangledPort;

        for( var i=0 ; i<transferList.length ; i++) {
          entangledPort = transferList[i]._getEntangledPort();
          entangledPort._currentTarget = worker;
        }

        MessageChannel.log(transferList, "handshake worker", worker);
        worker.postMessage( data );
      };
    }
  } else {
    if( Window ) {
      Window.postMessage = function( source, message, targetOrigin, ports ) {
        // Internet Explorer requires the `ports` parameter
        ports = ports || [];
        source.postMessage( message, targetOrigin, ports );
      };
    } else {
      // Web worker
      self.Worker = {
        postMessage: function( worker, message, transferList ) {
          worker.postMessage( message, transferList );
        }
      };
    }

    if( self.Worker ) {
      self.Worker.postMessage = function( worker, message, transferList )  {
        worker.postMessage( message, transferList);
      };
    }
  }
})(this);

define("oasis",
  ["oasis/util","oasis/xhr","oasis/connect","rsvp","oasis/logger","oasis/version","oasis/config","oasis/sandbox","oasis/sandbox_init","oasis/events","oasis/service","oasis/iframe_adapter","oasis/webworker_adapter","oasis/inline_adapter"],
  function(__dependency1__, __dependency2__, __dependency3__, RSVP, logger, Version, OasisConfiguration, Sandbox, autoInitializeSandbox, Events, Service, IframeAdapter, WebworkerAdapter, InlineAdapter) {
    "use strict";
    var assert = __dependency1__.assert;
    var delegate = __dependency1__.delegate;
    var xhr = __dependency2__.xhr;
    var connect = __dependency3__.connect;
    var connectCapabilities = __dependency3__.connectCapabilities;
    var portFor = __dependency3__.portFor;



    function Oasis() {
      // Data structures used by Oasis when creating sandboxes
      this.packages = {};
      this.requestId = 0;
      this.oasisId = 'oasis' + (+new Date());

      this.consumers = {};
      this.services = [];

      // Data structures used when connecting to a parent sandbox
      this.ports = {};
      this.handlers = {};

      this.receivedPorts = false;

      this.configuration = new OasisConfiguration();
      this.events = new Events();

      this.didCreate();
    }

    Oasis.Version = Version;
    Oasis.Service = Oasis.Consumer = Service;
    Oasis.RSVP = RSVP;

    Oasis.reset = function () {
      Oasis.adapters = {
        iframe: new IframeAdapter(),
        webworker: new WebworkerAdapter(),
        inline: new InlineAdapter()
      };
    };

    Oasis.reset();

    Oasis.prototype = {
      logger: logger,
      log: function () {
        this.logger.log.apply(this.logger, arguments);
      },

      on: delegate('events', 'on'),
      off: delegate('events', 'off'),
      trigger: delegate('events', 'trigger'),

      didCreate: function() {},

      xhr: xhr,

      /**
        This is the entry point that allows the containing environment to create a
        child sandbox.

        Options:

        * `capabilities`: an array of registered services
        * `url`: a registered URL to a JavaScript file that will initialize the
          sandbox in the sandboxed environment
        * `adapter`: a reference to an adapter that will handle the lifecycle
          of the sandbox. Right now, there are iframe and web worker adapters.

        @param {Object} options
      */
      createSandbox: function (options) {
        return new Sandbox(this, options);
      },

      /**
        This registers a sandbox type inside of the containing environment so that
        it can be referenced by URL in `createSandbox`.

        Options:

        * `capabilities`: An array of service names that will be supplied when calling
          `createSandbox`
        * `url`: The URL of the JavaScript file that contains the sandbox code

        @param {Object} options
      */
      register: function (options) {
        assert(options.capabilities, "You are trying to register a package without any capabilities. Please provide a list of requested capabilities, or an empty array ([]).");

        this.packages[options.url] = options;
      },

      configure: function(name, value) { this.configuration[name] = value; },
      autoInitializeSandbox: autoInitializeSandbox,

      connect: connect,
      connectCapabilities: connectCapabilities,
      portFor: portFor
    };



    return Oasis;
  });
define("oasis/base_adapter",
  ["oasis/util","oasis/shims","oasis/connect","oasis/message_channel","rsvp","oasis/logger"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, RSVP, Logger) {
    "use strict";
    var mustImplement = __dependency1__.mustImplement;
    var addEventListener = __dependency2__.addEventListener;
    var removeEventListener = __dependency2__.removeEventListener;
    var a_indexOf = __dependency2__.a_indexOf;
    var a_filter = __dependency2__.a_filter;
    var connectCapabilities = __dependency3__.connectCapabilities;
    var PostMessageMessageChannel = __dependency4__.PostMessageMessageChannel;



    function BaseAdapter() {
      this._unsupportedCapabilities = [];
    }

    BaseAdapter.prototype = {
      initializeSandbox: mustImplement('BaseAdapter', 'initializeSandbox'),
      name: mustImplement('BaseAdapter', 'name'),

      unsupportedCapabilities: function () {
        return this._unsupportedCapabilities;
      },

      addUnsupportedCapability: function (capability) {
        this._unsupportedCapabilities.push(capability);
      },

      filterCapabilities: function(capabilities) {
        var unsupported = this._unsupportedCapabilities;
        return a_filter.call(capabilities, function (capability) {
          var index = a_indexOf.call(unsupported, capability);
          return index === -1;
        });
      },

      createChannel: function(oasis) {
        var channel = new PostMessageMessageChannel(oasis);
        channel.port1.start();
        return channel;
      },

      environmentPort: function(sandbox, channel) {
        return channel.port1;
      },

      sandboxPort: function(sandbox, channel) {
        return channel.port2;
      },

      proxyPort: function(sandbox, port) {
        return port;
      },

      connectSandbox: function (receiver, oasis) {
        var adapter = this;

        Logger.log("Sandbox listening for initialization message");

        function initializeOasisSandbox(event) {
          if (!event.data.isOasisInitialization) { return; }

          removeEventListener(receiver, 'message', initializeOasisSandbox);
          adapter.initializeOasisSandbox(event, oasis);
        }
        addEventListener(receiver, 'message', initializeOasisSandbox);

        adapter.oasisLoaded(oasis);
      },

      initializeOasisSandbox: function (event, oasis) {
        var adapter = this;
        oasis.configuration.eventCallback(function () {
          Logger.log("sandbox: received initialization message.");

          oasis.connectCapabilities(event.data.capabilities, event.ports);

          adapter.didConnect(oasis);
        });
      },

      createInitializationMessage: function (sandbox) {
        return {
          isOasisInitialization: true,
          capabilities: sandbox._capabilitiesToConnect,
        };
      },

      oasisLoadedMessage: "oasisSandboxLoaded",
      sandboxInitializedMessage:  "oasisSandboxInitialized"
    };


    return BaseAdapter;
  });
define("oasis/config",
  [],
  function() {
    "use strict";
    /**
      Stores Oasis configuration.  Options include:

      - `eventCallback` - a function that wraps `message` event handlers.  By
        default the event hanlder is simply invoked.
      - `allowSameOrigin` - a card can be hosted on the same domain
      - `reconnect` - the default reconnect options for iframe sandboxes.  Possible values are:
        - "none" - do not allow sandbox reconnection
        - "verify" - only allow reconnections from the original origin of the sandbox
        - "any" - allow any sandbox reconnections.  Only use this setting if you are
          using Oasis strictly for isolation of trusted applications or if it's safe
          to connect your sandbox to arbitrary origins.  This is an advanced setting
          and should be used with care.
    */
    function OasisConfiguration() {
      this.eventCallback = function (callback) { callback(); };
      this.allowSameOrigin = false;
      this.reconnect = 'verify';
    }


    return OasisConfiguration;
  });
define("oasis/connect",
  ["oasis/util","oasis/shims","oasis/message_channel","rsvp","oasis/logger","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, RSVP, Logger, __exports__) {
    "use strict";
    var assert = __dependency1__.assert;
    var a_forEach = __dependency2__.a_forEach;
    var PostMessagePort = __dependency3__.PostMessagePort;


    function registerHandler(oasis, capability, options) {
      var port = oasis.ports[capability];

      if (port) {
        Logger.log(oasis.oasisId, "sandbox: found port, setting up '" + capability + "'");
        options.setupCapability(port);

        if (options.promise) {
          options.promise.then(function() {
            port.start();
          })['catch'](RSVP.rethrow);
        } else {
          port.start();
        }
      } else if (!oasis.receivedPorts) {
        Logger.log("No port found, saving handler for '" + capability + "'");
        oasis.handlers[capability] = options;
      } else {
        Logger.log("No port was sent for capability '" + capability + "'");
        options.rejectCapability();
      }
    }

    /**
      This is the main entry point that allows sandboxes to connect back
      to their containing environment.

      It can be called either with a set of named consumers, with callbacks, or using promises.

      Example

        // Using promises
        Oasis.connect('foo').then( function (port) {
          port.send('hello');
        }, function () {
          // error
        });


        // using callbacks
        Oasis.connect('foo', function (port) {
          port.send('hello');
        }, errorHandler);


        // connecting several consumers at once.
        var ConsumerA = Oasis.Consumer.extend({
          initialize: function (port) { this.port = port; },

          error: function () { }
        });

        var ConsumerB = Oasis.Consumer.extend({
          initialize: function (port) { this.port = port; },

          error: function () { }
        });

        Oasis.connect({
          consumers: {
            capabilityA: ConsumerA,
            capabilityB: ConsumerB
          }
        });

      @param {String} capability the name of the service to connect to, or an object
        containing named consumers to connect.
      @param {Function?} callback the callback to trigger once the other
        side of the connection is available.
      @param {Function?} errorCallback the callback to trigger if the capability is
        not provided by the environment.
      @return {Promise} a promise that will be resolved once the other
        side of the connection is available. You can use this instead
        of the callbacks.
    */
    function connect(capability, callback, errorCallback) {
      if (typeof capability === 'object') {
        return connectConsumers(this, capability.consumers);
      } else if (callback) {
        return connectCallbacks(this, capability, callback, errorCallback);
      } else {
        return connectPromise(this, capability);
      }
    }

    function connectCapabilities(capabilities, eventPorts) {
      var oasis = this;
      a_forEach.call(capabilities, function(capability, i) {
        var handler = oasis.handlers[capability],
            port = new PostMessagePort(oasis, eventPorts[i]);

        if (handler) {
          Logger.log("Invoking handler for '" + capability + "'");

          RSVP.resolve(handler.setupCapability(port)).then(function () {
            port.start();
          })['catch'](RSVP.rethrow);
        }

        oasis.ports[capability] = port;
      });

      // for each handler w/o capability, reject
      for( var prop in oasis.handlers ) {
        if( ! oasis.ports[prop] ) {
          oasis.handlers[prop].rejectCapability();
        }
      }

      this.receivedPorts = true;
    }

    function portFor(capability) {
      var port = this.ports[capability];
      assert(port, "You asked for the port for the '" + capability + "' capability, but the environment did not provide one.");
      return port;
    }


    function connectConsumers(oasis, consumers) {
      function setupCapability(Consumer, name) {
        return function(port) {
          var consumer = new Consumer(port);
          oasis.consumers[name] = consumer;
          consumer.initialize(port, name);
        };
      }

      function rejectCapability(prop) {
        return function () {
          consumers[prop].prototype.error();
        };
      }

      for (var prop in consumers) {
        registerHandler(oasis, prop, {
          setupCapability: setupCapability(consumers[prop], prop),
          rejectCapability: rejectCapability(prop)
        });
      }
    }

    function connectCallbacks(oasis, capability, callback, errorCallback) {
      Logger.log("Connecting to '" + capability + "' with callback.");

      registerHandler(oasis, capability, {
        setupCapability: function(port) {
          callback(port);
        },
        rejectCapability: function () {
          if (errorCallback) {
            errorCallback();
          }
        }
      });
    }

    function connectPromise(oasis, capability) {
      Logger.log("Connecting to '" + capability + "' with promise.");

      var defered = RSVP.defer();
      registerHandler(oasis, capability, {
        promise: defered.promise,
        setupCapability: function(port) {
          defered.resolve(port);
          return defered.promise;
        },
        rejectCapability: function () {
          defered.reject();
        }
      });
      return defered.promise;
    }

    __exports__.registerHandler = registerHandler;
    __exports__.connect = connect;
    __exports__.connectCapabilities = connectCapabilities;
    __exports__.portFor = portFor;
  });
define("oasis/events",
  [],
  function() {
    "use strict";
    var a_slice = Array.prototype.slice;

    function Events() {
      this.listenerArrays = {};
    }

    Events.prototype = {
      on: function (eventName, listener) {
        var listeners = this.listenerArrays[eventName] = this.listenerArrays[eventName] || [];

        listeners.push(listener);
      },

      off: function (eventName, listener) {
        var listeners = this.listenerArrays[eventName];
        if (!listeners) { return; }

        for (var i=0; i<listeners.length; ++i) {
          if (listeners[i] === listener) {
            listeners.splice(i, 1);
            break;
          }
        }
      },

      clear: function(eventName) {
        delete this.listenerArrays[eventName];
      },

      trigger: function(eventName) {
        var listeners = this.listenerArrays[eventName];
        if (!listeners) { return; }

        var args = a_slice.call(arguments, 1);

        for (var i=0; i<listeners.length; ++i) {
          listeners[i].apply(null, args);
        }
      }
    };


    return Events;
  });
define("oasis/iframe_adapter",
  ["oasis/util","oasis/shims","rsvp","oasis/logger","oasis/base_adapter"],
  function(__dependency1__, __dependency2__, RSVP, Logger, BaseAdapter) {
    "use strict";
    var assert = __dependency1__.assert;
    var extend = __dependency1__.extend;
    var a_forEach = __dependency2__.a_forEach;
    var addEventListener = __dependency2__.addEventListener;
    var removeEventListener = __dependency2__.removeEventListener;
    var a_map = __dependency2__.a_map;
    /*global Window, UUID */



    function verifySandbox(oasis, sandboxUrl) {
      var iframe = document.createElement('iframe'),
          link;

      if( (oasis.configuration.allowSameOrigin && iframe.sandbox !== undefined) ||
          (iframe.sandbox === undefined) ) {
        // The sandbox attribute isn't supported (IE8/9) or we want a child iframe
        // to access resources from its own domain (youtube iframe),
        // we need to make sure the sandbox is loaded from a separate domain
        link = document.createElement('a');
        link.href = sandboxUrl;

        if( !link.host || (link.protocol === window.location.protocol && link.host === window.location.host) ) {
          throw new Error("Security: iFrames from the same host cannot be sandboxed in older browsers and is disallowed.  " +
                          "For HTML5 browsers supporting the `sandbox` attribute on iframes, you can add the `allow-same-origin` flag" +
                          "only if you host the sandbox on a separate domain.");
        }
      }
    }

    function verifyCurrentSandboxOrigin(sandbox, event) {
      var linkOriginal, linkCurrent;

      if (sandbox.firstLoad || sandbox.options.reconnect === "any") {
        return true;
      }

      if (!sandbox.oasis.configuration.allowSameOrigin || event.origin === "null") {
        fail();
      } else {
        linkOriginal = document.createElement('a');
        linkCurrent = document.createElement('a');

        linkOriginal.href = sandbox.options.url;
        linkCurrent.href = event.origin;

        if (linkCurrent.protocol === linkOriginal.protocol &&
            linkCurrent.host === linkOriginal.host) {
          return true;
        }

        fail();
      }

      function fail() {
        sandbox.onerror(
          new Error("Cannot reconnect null origins unless `reconnect` is set to " +
                    "'any'.  `reconnect: 'verify' requires `allowSameOrigin: " +
                    "true`"));
      }
    }

    function isUrl(s) {
      var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
    }

    var IframeAdapter = extend(BaseAdapter, {
      //-------------------------------------------------------------------------
      // Environment API

      initializeSandbox: function(sandbox) {
        var options = sandbox.options,
            iframe = document.createElement('iframe'),
            sandboxAttributes = ['allow-scripts'];

        if( sandbox.oasis.configuration.allowSameOrigin ) {
          sandboxAttributes.push('allow-same-origin');
        }
        if( options && options.sandbox && options.sandbox.popups ) {
          sandboxAttributes.push('allow-popups');
        }

        iframe.name = sandbox.options.url + '?uuid=' + UUID.generate();
        iframe.sandbox = sandboxAttributes.join(' ');
        iframe.seamless = true;

        // rendering-specific code
        if (options.width) {
          iframe.width = options.width;
        } else if (options.height) {
          iframe.height = options.height;
        }

        // Error handling inside the iFrame
        iframe.errorHandler = function(event) {
          if(!event.data.sandboxException) {return;}
          try {
            // verify this message came from the expected sandbox; try/catch
            // because ie8 will disallow reading contentWindow in the case of
            // another sandbox's message
            if( event.source !== iframe.contentWindow ) {return;}
          } catch(e) {
            return;
          }

          sandbox.onerror( event.data.sandboxException );
        };
        addEventListener(window, 'message', iframe.errorHandler);

        verifySandbox( sandbox.oasis, sandbox.options.url );
        iframe.src = sandbox.options.url;

        Logger.log('Initializing sandbox ' + iframe.name);

        // Promise that sandbox has loaded and capabilities connected at least once.
        // This does not mean that the sandbox will be loaded & connected in the
        // face of reconnects (eg pages that navigate)
        sandbox._waitForLoadDeferred().resolve(new RSVP.Promise( function(resolve, reject) {
          iframe.initializationHandler = function (event) {
            if( event.data !== sandbox.adapter.sandboxInitializedMessage ) {return;}
            try {
              // verify this message came from the expected sandbox; try/catch
              // because ie8 will disallow reading contentWindow in the case of
              // another sandbox's message
              if( event.source !== iframe.contentWindow ) {return;}
            } catch(e) {
              return;
            }
            removeEventListener(window, 'message', iframe.initializationHandler);

            sandbox.oasis.configuration.eventCallback(function () {
              Logger.log("container: iframe sandbox has initialized (capabilities connected)");
              resolve(sandbox);
            });
          };
          addEventListener(window, 'message', iframe.initializationHandler);
        }));

        sandbox.el = iframe;

        iframe.oasisLoadHandler = function (event) {
          if( event.data !== sandbox.adapter.oasisLoadedMessage ) {return;}
          try {
            // verify this message came from the expected sandbox; try/catch
            // because ie8 will disallow reading contentWindow in the case of
            // another sandbox's message
            if( event.source !== iframe.contentWindow ) {return;}
          } catch(e) {
            return;
          }

          Logger.log("container: iframe sandbox has loaded Oasis");


          if (verifyCurrentSandboxOrigin(sandbox, event)) {
            sandbox.createAndTransferCapabilities();
          }

          if (sandbox.options.reconnect === "none") {
            removeEventListener(window, 'message', iframe.oasisLoadHandler);
          }
        };
        addEventListener(window, 'message', iframe.oasisLoadHandler);
      },

      startSandbox: function(sandbox) {
        var head = document.head || document.documentElement.getElementsByTagName('head')[0];
        head.appendChild(sandbox.el);
      },

      terminateSandbox: function(sandbox) {
        var el = sandbox.el;

        sandbox.terminated = true;

        if (el.loadHandler) {
          // no load handler for HTML sandboxes
          removeEventListener(el, 'load', el.loadHandler);
        }
        removeEventListener(window, 'message', el.initializationHandler);
        removeEventListener(window, 'message', el.oasisLoadHandler);

        if (el.parentNode) {
          Logger.log("Terminating sandbox ", sandbox.el.name);
          el.parentNode.removeChild(el);
        }

        sandbox.el = null;
      },

      connectPorts: function(sandbox, ports) {
        var rawPorts = a_map.call(ports, function(port) { return port.port; }),
            message = this.createInitializationMessage(sandbox);

        if (sandbox.terminated) { return; }
        Window.postMessage(sandbox.el.contentWindow, message, '*', rawPorts);
      },

      //-------------------------------------------------------------------------
      // Sandbox API

      connectSandbox: function(oasis) {
        return BaseAdapter.prototype.connectSandbox.call(this, window, oasis);
      },

      oasisLoaded: function() {
        window.parent.postMessage(this.oasisLoadedMessage, '*', []);
      },

      didConnect: function() {
        window.parent.postMessage(this.sandboxInitializedMessage, '*', []);
      },

      name: function(sandbox) {
        return sandbox.el.name;
      }

    });


    return IframeAdapter;
  });
define("oasis/inline_adapter",
  ["oasis/util","oasis/config","oasis/shims","oasis/xhr","rsvp","oasis/logger","oasis/base_adapter"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, RSVP, Logger, BaseAdapter) {
    "use strict";
    var assert = __dependency1__.assert;
    var extend = __dependency1__.extend;
    var noop = __dependency1__.noop;
    var configuration = __dependency2__.configuration;
    var a_forEach = __dependency3__.a_forEach;
    var a_map = __dependency3__.a_map;
    var xhr = __dependency4__.xhr;
    /*global self, postMessage, importScripts */



    var InlineAdapter = extend(BaseAdapter, {
      //-------------------------------------------------------------------------
      // Environment API

      initializeSandbox: function(sandbox) {
        sandbox.el = document.createElement('div');

        var oasis = sandbox.sandboxedOasis = new Oasis();
        sandbox.sandboxedOasis.sandbox = sandbox;
        RSVP.async(function () {
          sandbox.createAndTransferCapabilities();
        });
      },

      startSandbox: function(sandbox) {
        var body = document.body || document.documentElement.getElementsByTagName('body')[0];
        body.appendChild(sandbox.el);
      },

      terminateSandbox: function(sandbox) {
        var el = sandbox.el;

        if (el.parentNode) {
          Logger.log("Terminating sandbox ", sandbox.el.name);
          el.parentNode.removeChild(el);
        }

        sandbox.el = null;
      },

      connectPorts: function(sandbox, ports) {
        var rawPorts = a_map.call(ports, function(oasisPort){ return oasisPort.port; }),
            message = this.createInitializationMessage(sandbox),
            event = { data: message, ports: rawPorts };

        // Normally `connectSandbox` is called in autoinitialization, but there
        // isn't a real sandbox here.
        this.connectSandbox(sandbox.sandboxedOasis, event);
      },

      fetchResource: function (url, oasis) {
        var adapter = this;

        return xhr(url, {
          dataType: 'text'
        }, oasis).then(function (code) {
          return adapter.wrapResource(code);
        })['catch'](RSVP.rethrow);
      },

      wrapResource: function (code) {
        return new Function("oasis", code);
      },

      //-------------------------------------------------------------------------
      // Sandbox API

      connectSandbox: function(oasis, pseudoEvent) {
        return this.initializeOasisSandbox(pseudoEvent, oasis);
      },

      oasisLoaded: noop,

      didConnect: function(oasis) {
        var adapter = this;

        return oasis.sandbox._waitForLoadDeferred().resolve(loadSandboxJS()['catch'](RSVP.rethrow));

        function applySandboxJS(sandboxFn) {
          Logger.log("sandbox: inline sandbox initialized");
          sandboxFn(oasis);
          return oasis.sandbox;
        }

        function loadSandboxJS() {
          return new RSVP.Promise(function (resolve, reject) {
            resolve(adapter.fetchResource(oasis.sandbox.options.url, oasis).
              then(applySandboxJS));
          });
        }
      },
    });


    return InlineAdapter;
  });
define("oasis/logger",
  [],
  function() {
    "use strict";
    function Logger() {
      this.enabled = false;
    }

    Logger.prototype = {
      enable: function () {
        this.enabled = true;
      },

      disable: function () {
        this.enabled = false;
      },

      log: function () {
        if (logger.enabled) {
          if (typeof console !== 'undefined' && typeof console.log === 'function') {
            console.log.apply(console, arguments);
          } else if (typeof console !== 'undefined' && typeof console.log === 'object') {
            // Log in IE
            try {
              switch (arguments.length) {
                case 1:
                  console.log(arguments[0]);
                  break;
                case 2:
                  console.log(arguments[0], arguments[1]);
                  break;
                default:
                  console.log(arguments[0], arguments[1], arguments[2]);
              }
            } catch(e) {}
          }
        }
      }
    };

    var logger = new Logger();


    return logger;
  });
define("oasis/message_channel",
  ["oasis/util","rsvp","exports"],
  function(__dependency1__, RSVP, __exports__) {
    "use strict";
    var extend = __dependency1__.extend;
    var mustImplement = __dependency1__.mustImplement;

    /**
      OasisPort is an interface that adapters can use to implement ports.
      Ports are passed into the `initialize` method of services and consumers,
      and are available as `this.port` on services and consumers.

      Ports are the low-level API that can be used to communicate with the
      other side of a connection. In general, you will probably want to use
      the `events` and `requests` objects inside your service or consumer
      rather than manually listen for events and requests.

      @constructor
      @param {OasisPort} oasis
      @param {OasisPort} port
    */
    function OasisPort(oasis, port) {}


    function getRequestId(oasis) {
      return oasis.oasisId + '-' + oasis.requestId++;
    }

    OasisPort.prototype = {
      /**
        This allows you to register an event handler for a particular event
        name.

        @param {String} eventName the name of the event
        @param {Function} callback the callback to call when the event occurs
        @param {any?} binding an optional value of `this` inside of the callback
      */
      on: mustImplement('OasisPort', 'on'),

      /**
        Allows you to register an event handler that is called for all events
        that are sent to the port.
      */
      all: mustImplement('OasisPort', 'all'),

      /**
        This allows you to unregister an event handler for an event name
        and callback. You should not pass in the optional binding.

        @param {String} eventName the name of the event
        @param {Function} callback a reference to the callback that was
          passed into `.on`.
      */
      off: mustImplement('OasisPort', 'off'),

      /**
        This method sends an event to the other side of the connection.

        @param {String} eventName the name of the event
        @param {Structured?} data optional data to pass along with the event
      */
      send: mustImplement('OasisPort', 'send'),

      /**
        @private

        Adapters should implement this to start receiving messages from the
        other side of the connection.

        It is up to the adapter to make sure that no messages are dropped if
        they are sent before `start` is called.
      */
      start: mustImplement('OasisPort', 'start'),

      /**
        @private

        Adapters should implement this to stop receiving messages from the
        other side of the connection.
      */
      close: mustImplement('OasisPort', 'close'),

      /**
        This method sends a request to the other side of the connection.

        @param {String} requestName the name of the request
        @return {Promise} a promise that will be resolved with the value
          provided by the other side of the connection, or rejected if the other
          side indicates retrieving the value resulted in an error. The fulfillment
          value must be structured data.
      */
      request: function(eventName) {
        var oasis = this.oasis;
        var port = this;
        var args = [].slice.call(arguments, 1);

        return new RSVP.Promise(function (resolve, reject) {
          var requestId = getRequestId(oasis);

          var clearObservers = function () {
            port.off('@response:' + eventName, observer);
            port.off('@errorResponse:' + eventName, errorObserver);
          };

          var observer = function(event) {
            if (event.requestId === requestId) {
              clearObservers();
              resolve(event.data);
            }
          };

          var errorObserver = function (event) {
            if (event.requestId === requestId) {
              clearObservers();
              reject(event.data);
            }
          };

          port.on('@response:' + eventName, observer, port);
          port.on('@errorResponse:' + eventName, errorObserver, port);
          port.send('@request:' + eventName, { requestId: requestId, args: args });
        });
      },

      /**
        This method registers a callback to be called when a request is made
        by the other side of the connection.

        The callback will be called with any arguments passed in the request.  It
        may either return a value directly, or return a promise if the value must be
        retrieved asynchronously.

        Examples:

          // This completes the request immediately.
          service.onRequest('name', function () {
            return 'David';
          });


          // This completely the request asynchronously.
          service.onRequest('name', function () {
            return new Oasis.RSVP.Promise(function (resolve, reject) {
              setTimeout( function() {
                resolve('David');
              }, 200);
            });
          });

        @param {String} requestName the name of the request
        @param {Function} callback the callback to be called when a request
          is made.
        @param {any?} binding the value of `this` in the callback
      */
      onRequest: function(eventName, callback, binding) {
        var self = this;

        this.on('@request:' + eventName, function(data) {
          var requestId = data.requestId,
              args = data.args,
              getResponse = new RSVP.Promise(function (resolve, reject) {
                var value = callback.apply(binding, data.args);
                if (undefined !== value) {
                  resolve(value);
                } else {
                  reject("@request:" + eventName + " [" + data.requestId + "] did not return a value.  If you want to return a literal `undefined` return `RSVP.resolve(undefined)`");
                }
              });

          getResponse.then(function (value) {
            self.send('@response:' + eventName, {
              requestId: requestId,
              data: value
            });
          }, function (error) {
            var value = error;
            if (error instanceof Error) {
              value = {
                message: error.message,
                stack: error.stack
              };
            }
            self.send('@errorResponse:' + eventName, {
              requestId: requestId,
              data: value
            });
          });
        });
      }
    };


    function OasisMessageChannel(oasis) {}

    OasisMessageChannel.prototype = {
      start: mustImplement('OasisMessageChannel', 'start')
    };


    var PostMessageMessageChannel = extend(OasisMessageChannel, {
      initialize: function(oasis) {
        this.channel = new MessageChannel();
        this.port1 = new PostMessagePort(oasis, this.channel.port1);
        this.port2 = new PostMessagePort(oasis, this.channel.port2);
      },

      start: function() {
        this.port1.start();
        this.port2.start();
      },

      destroy: function() {
        this.port1.close();
        this.port2.close();
        delete this.port1;
        delete this.port2;
        delete this.channel;
      }
    });

    var PostMessagePort = extend(OasisPort, {
      initialize: function(oasis, port) {
        this.oasis = oasis;
        this.port = port;
        this._callbacks = [];
      },

      on: function(eventName, callback, binding) {
        var oasis = this.oasis;

        function wrappedCallback(event) {
          if (event.data.type === eventName) {
            oasis.configuration.eventCallback(function () {
              return callback.call(binding, event.data.data);
            });
          }
        }

        this._callbacks.push([callback, wrappedCallback]);
        this.port.addEventListener('message', wrappedCallback);
      },

      all: function(callback, binding) {
        var oasis = this.oasis;

        function wrappedCallback(event) {
          oasis.configuration.eventCallback(function () {
            callback.call(binding, event.data.type, event.data.data);
          });
        }

        this.port.addEventListener('message', wrappedCallback);
      },

      off: function(eventName, callback) {
        var foundCallback;

        for (var i=0, l=this._callbacks.length; i<l; i++) {
          foundCallback = this._callbacks[i];
          if (foundCallback[0] === callback) {
            this.port.removeEventListener('message', foundCallback[1]);
          }
        }
      },

      send: function(eventName, data) {
        this.port.postMessage({
          type: eventName,
          data: data
        });
      },

      start: function() {
        this.port.start();
      },

      close: function() {
        var foundCallback;

        for (var i=0, l=this._callbacks.length; i<l; i++) {
          foundCallback = this._callbacks[i];
          this.port.removeEventListener('message', foundCallback[1]);
        }
        this._callbacks = [];

        this.port.close();
      }
    });

    __exports__.OasisPort = OasisPort;
    __exports__.PostMessageMessageChannel = PostMessageMessageChannel;
    __exports__.PostMessagePort = PostMessagePort;
  });
define("oasis/sandbox",
  ["oasis/util","oasis/shims","oasis/message_channel","rsvp","oasis/logger"],
  function(__dependency1__, __dependency2__, __dependency3__, RSVP, Logger) {
    "use strict";
    var assert = __dependency1__.assert;
    var uniq = __dependency1__.uniq;
    var reverseMerge = __dependency1__.reverseMerge;
    var a_forEach = __dependency2__.a_forEach;
    var a_reduce = __dependency2__.a_reduce;
    var a_filter = __dependency2__.a_filter;
    var OasisPort = __dependency3__.OasisPort;


    var OasisSandbox = function(oasis, options) {
      options = reverseMerge(options || {}, {
        reconnect: oasis.configuration.reconnect
      });

      var reconnect = options.reconnect;
      assert( reconnect === "none" || reconnect === "verify" || reconnect === "any",
              "`reconnect` must be one of 'none', 'verify' or 'any'.  '" + reconnect + "' is invalid.");

      this.connections = {};
      this.wiretaps = [];

      this.oasis = oasis;

      // Generic capabilities code
      var pkg = oasis.packages[options.url];

      var capabilities = options.capabilities;
      if (!capabilities) {
        assert(pkg, "You are trying to create a sandbox from an unregistered URL without providing capabilities. Please use Oasis.register to register your package or pass a list of capabilities to createSandbox.");
        capabilities = pkg.capabilities;
      }

      pkg = pkg || {};

      this.adapter = options.adapter || Oasis.adapters.iframe;

      this._capabilitiesToConnect = this._filterCapabilities(capabilities);
      this.envPortDefereds = {};
      this.sandboxPortDefereds = {};
      this.channels = {};
      this.capabilities = {};
      this.options = options;
      this.firstLoad = true;

      var sandbox = this;
      this.promisePorts();
      this.adapter.initializeSandbox(this);
    };

    OasisSandbox.prototype = {
      waitForLoad: function () {
        return this._waitForLoadDeferred().promise;
      },

      wiretap: function(callback) {
        this.wiretaps.push(callback);
      },

      connect: function(capability) {
        var portPromise = this.envPortDefereds[capability].promise;

        assert(portPromise, "Connect was called on '" + capability + "' but no such capability was registered.");

        return portPromise;
      },

      createAndTransferCapabilities: function () {
        if (!this.firstLoad) { this.promisePorts(); }

        this.createChannels();
        this.connectPorts();

        // subsequent calls to `createAndTransferCapabilities` requires new port promises
        this.firstLoad = false;
      },

      promisePorts: function () {
        a_forEach.call(this._capabilitiesToConnect, function(capability) {
          this.envPortDefereds[capability] = RSVP.defer();
          this.sandboxPortDefereds[capability] = RSVP.defer();
        }, this);
      },

      createChannels: function () {
        var sandbox = this,
            services = this.options.services || {},
            channels = this.channels;
        a_forEach.call(this._capabilitiesToConnect, function (capability) {

          Logger.log("container: Will create port for '" + capability + "'");
          var service = services[capability],
              channel, port;

          // If an existing port is provided, just
          // pass it along to the new sandbox.

          // TODO: This should probably be an OasisPort if possible
          if (service instanceof OasisPort) {
            port = this.adapter.proxyPort(this, service);
            this.capabilities[capability] = service;
          } else {
            channel = channels[capability] = this.adapter.createChannel(sandbox.oasis);

            var environmentPort = this.adapter.environmentPort(this, channel),
                sandboxPort = this.adapter.sandboxPort(this, channel);

            Logger.log("container: Wiretapping '" + capability + "'");

            environmentPort.all(function(eventName, data) {
              a_forEach.call(this.wiretaps, function(wiretap) {
                wiretap(capability, {
                  type: eventName,
                  data: data,
                  direction: 'received'
                });
              });
            }, this);

            a_forEach.call(this.wiretaps, function(wiretap) {
              var originalSend = environmentPort.send;

              environmentPort.send = function(eventName, data) {
                wiretap(capability, {
                  type: eventName,
                  data: data,
                  direction: 'sent'
                });

                originalSend.apply(environmentPort, arguments);
              };
            });

            if (service) {
              Logger.log("container: Creating service for '" + capability + "'");
              /*jshint newcap:false*/
              // Generic
              service = new service(environmentPort, this);
              service.initialize(environmentPort, capability);
              sandbox.oasis.services.push(service);
              this.capabilities[capability] = service;
            }

            // Law of Demeter violation
            port = sandboxPort;

            this.envPortDefereds[capability].resolve(environmentPort);
          }

          Logger.log("container: Port created for '" + capability + "'");
          this.sandboxPortDefereds[capability].resolve(port);
        }, this);
      },

      destroyChannels: function() {
        for( var prop in this.channels ) {
          this.channels[prop].destroy();
          delete this.channels[prop];
        }
        this.channels = [];
      },

      connectPorts: function () {
        var sandbox = this;

        var allSandboxPortPromises = a_reduce.call(this._capabilitiesToConnect, function (accumulator, capability) {
          return accumulator.concat(sandbox.sandboxPortDefereds[capability].promise);
        }, []);

        RSVP.all(allSandboxPortPromises).then(function (ports) {
          Logger.log("container: All " + ports.length + " ports created.  Transferring them.");
          sandbox.adapter.connectPorts(sandbox, ports);
        })['catch'](RSVP.rethrow);
      },

      start: function(options) {
        this.adapter.startSandbox(this, options);
      },

      terminate: function() {
        var sandbox = this,
            channel,
            environmentPort;

        if( this.isTerminated ) { return; }
        this.isTerminated = true;

        this.adapter.terminateSandbox(this);

        this.destroyChannels();

        for( var index=0 ; index<sandbox.oasis.services.length ; index++) {
          sandbox.oasis.services[index].destroy();
          delete sandbox.oasis.services[index];
        }
        sandbox.oasis.services = [];
      },

      onerror: function(error) {
        throw error;
      },

      name: function() {
        return this.adapter.name(this);
      },

      // Oasis internal

      _filterCapabilities: function(capabilities) {
        return uniq.call(this.adapter.filterCapabilities(capabilities));
      },

      _waitForLoadDeferred: function () {
        if (!this._loadDeferred) {
          // the adapter will resolve this
          this._loadDeferred = RSVP.defer();
        }

        return this._loadDeferred;
      }
    };


    return OasisSandbox;
  });
define("oasis/sandbox_init",
  [],
  function() {
    "use strict";
    function autoInitializeSandbox () {
      if (typeof window !== 'undefined') {
        if (/PhantomJS/.test(navigator.userAgent)) {
          // We don't support phantomjs for several reasons, including
          //  - window.constructor vs Window
          //  - postMessage must not have ports (but recall in IE postMessage must
          //    have ports)
          //  - because of the above we need to polyfill, but we fail to do so
          //    because we see MessageChannel in global object
          //  - we erroneously try to decode the oasis load message; alternatively
          //    we should just encode the init message
          //  - all the things we haven't noticed yet
          return;
        }

        if (window.parent && window.parent !== window) {
          Oasis.adapters.iframe.connectSandbox(this);
        }
      } else {
        Oasis.adapters.webworker.connectSandbox(this);
      }
    }


    return autoInitializeSandbox;
  });
define("oasis/service",
  ["oasis/shims"],
  function(__dependency1__) {
    "use strict";
    var o_create = __dependency1__.o_create;

    /**
      This is a base class that services and consumers can subclass to easily
      implement a number of events and requests at once.

      Example:

          var MetadataService = Oasis.Service.extend({
            initialize: function() {
              this.send('data', this.sandbox.data);
            },

            events: {
              changed: function(data) {
                this.sandbox.data = data;
              }
            },

            requests: {
              valueForProperty: function(name, promise) {
                promise.resolve(this.sandbox.data[name]);
              }
            }
          });

      In the above example, the metadata service implements the Service
      API using `initialize`, `events` and `requests`.

      Both services (implemented in the containing environment) and
      consumers (implemented in the sandbox) use the same API for
      registering events and requests.

      In the containing environment, a service is registered in the
      `createSandbox` method. In the sandbox, a consumer is registered
      using `Oasis.connect`.

      ### `initialize`

      Oasis calls the `initialize` method once the other side of the
      connection has initialized the connection.

      This method is useful to pass initial data back to the other side
      of the connection. You can also set up events or requests manually,
      but you will usually want to use the `events` and `requests` sections
      for events and requests.

      ### `events`

      The `events` object is a list of event names and associated callbacks.
      Oasis will automatically set up listeners for each named event, and
      trigger the callback with the data provided by the other side of the
      connection.

      ### `requests`

      The `requests` object is a list of request names and associated
      callbacks. Oasis will automatically set up listeners for requests
      made by the other side of the connection, and trigger the callback
      with the request information as well as a promise that you should
      use to fulfill the request.

      Once you have the information requested, you should call
      `promise.resolve` with the response data.

      @constructor
      @param {OasisPort} port
      @param {OasisSandbox} sandbox in the containing environment, the
        OasisSandbox that this service is connected to.
    */
    function Service (port, sandbox) {
      var service = this, prop, callback;

      this.sandbox = sandbox;
      this.port = port;

      function xform(callback) {
        return function() {
          return callback.apply(service, arguments);
        };
      }

      for (prop in this.events) {
        callback = this.events[prop];
        port.on(prop, xform(callback));
      }

      for (prop in this.requests) {
        callback = this.requests[prop];
        port.onRequest(prop, xform(callback));
      }
    }

    Service.prototype = {
      /**
        This hook is called when the connection is established. When
        `initialize` is called, it is safe to register listeners and
        send data to the other side.

        The implementation of Oasis makes it impossible for messages
        to get dropped on the floor due to timing issues.

        @param {OasisPort} port the port to the other side of the connection
        @param {String} name the name of the service
      */
      initialize: function() {},


      /**
        This hooks is called when an attempt is made to connect to a capability the
        environment does not provide.
      */
      error: function() {},

      /**
        This hook is called when the connection is stopped. When
        `destroy` is called, it is safe to unregister listeners.
      */
      destroy: function() {},

      /**
        This method can be used to send events to the other side of the
        connection.

        @param {String} eventName the name of the event to send to the
          other side of the connection
        @param {Structured} data an additional piece of data to include
          as the data for the event.
      */
      send: function() {
        return this.port.send.apply(this.port, arguments);
      },

      /**
        This method can be used to request data from the other side of
        the connection.

        @param {String} requestName the name of the request to send to
          the other side of the connection.
        @return {Promise} a promise that will be resolved by the other
          side of the connection. Use `.then` to wait for the resolution.
      */
      request: function() {
        return this.port.request.apply(this.port, arguments);
      }
    };

    Service.extend = function extend(object) {
      var superConstructor = this;

      function Service() {
        if (Service.prototype.init) { Service.prototype.init.call(this); }
        superConstructor.apply(this, arguments);
      }

      Service.extend = extend;

      var ServiceProto = Service.prototype = o_create(this.prototype);

      for (var prop in object) {
        ServiceProto[prop] = object[prop];
      }

      return Service;
    };


    return Service;
  });
define("oasis/shims",
  ["exports"],
  function(__exports__) {
    "use strict";
    var K = function() {};

    function o_create(obj, props) {
      K.prototype = obj;
      obj = new K();
      if (props) {
        K.prototype = obj;
        for (var prop in props) {
          K.prototype[prop] = props[prop].value;
        }
        obj = new K();
      }
      K.prototype = null;

      return obj;
    }

    // If it turns out we need a better polyfill we can grab mozilla's at:
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.removeEventListener#Polyfill_to_support_older_browsers
    function addEventListener(receiver, eventName, fn) {
      if (receiver.addEventListener) {
        return receiver.addEventListener(eventName, fn);
      } else if (receiver.attachEvent) {
        return receiver.attachEvent('on' + eventName, fn);
      }
    }

    function removeEventListener(receiver, eventName, fn) {
      if (receiver.removeEventListener) {
        return receiver.removeEventListener(eventName, fn);
      } else if (receiver.detachEvent) {
        return receiver.detachEvent('on' + eventName, fn);
      }
    }

    function isNativeFunc(func) {
      // This should probably work in all browsers likely to have ES5 array methods
      return func && Function.prototype.toString.call(func).indexOf('[native code]') > -1;
    }

    var a_forEach = isNativeFunc(Array.prototype.forEach) ? Array.prototype.forEach : function(fun /*, thisp */) {
      if (this === void 0 || this === null) {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== "function") {
        throw new TypeError();
      }

      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in t) {
          fun.call(thisp, t[i], i, t);
        }
      }
    };

    var a_reduce = isNativeFunc(Array.prototype.reduce) ? Array.prototype.reduce : function(callback, opt_initialValue){
      if (null === this || 'undefined' === typeof this) {
        // At the moment all modern browsers, that support strict mode, have
        // native implementation of Array.prototype.reduce. For instance, IE8
        // does not support strict mode, so this check is actually useless.
        throw new TypeError(
            'Array.prototype.reduce called on null or undefined');
      }
      if ('function' !== typeof callback) {
        throw new TypeError(callback + ' is not a function');
      }
      var index = 0, length = this.length >>> 0, value, isValueSet = false;
      if (1 < arguments.length) {
        value = opt_initialValue;
        isValueSet = true;
      }
      for ( ; length > index; ++index) {
        if (!this.hasOwnProperty(index)) continue;
        if (isValueSet) {
          value = callback(value, this[index], index, this);
        } else {
          value = this[index];
          isValueSet = true;
        }
      }
      if (!isValueSet) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      return value;
    };

    var a_map = isNativeFunc(Array.prototype.map) ? Array.prototype.map : function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
          throw new TypeError(" this is null or not defined");
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
          throw new TypeError(callback + " is not a function");
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg) {
          T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) where Array is
        // the standard built-in constructor with that name and len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while(k < len) {

          var kValue, mappedValue;

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if (k in O) {

            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
            kValue = O[ k ];

            // ii. Let mappedValue be the result of calling the Call internal method of callback
            // with T as the this value and argument list containing kValue, k, and O.
            mappedValue = callback.call(T, kValue, k, O);

            // iii. Call the DefineOwnProperty internal method of A with arguments
            // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
            // and false.

            // In browsers that support Object.defineProperty, use the following:
            // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

            // For best browser support, use the following:
            A[ k ] = mappedValue;
          }
          // d. Increase k by 1.
          k++;
        }

        // 9. return A
        return A;
      };

    var a_indexOf = isNativeFunc(Array.prototype.indexOf) ? Array.prototype.indexOf : function (searchElement /*, fromIndex */ ) {
      /* jshint eqeqeq:false */
      "use strict";
      if (this == null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;

      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) { // shortcut for verifying if it's NaN
          n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };

    var a_filter = isNativeFunc(Array.prototype.filter) ? Array.prototype.filter : function(fun /*, thisp*/) {
      'use strict';

      if (!this) {
        throw new TypeError();
      }

      var objects = Object(this);
      var len = objects.length >>> 0;
      if (typeof fun !== 'function') {
        throw new TypeError();
      }

      var res = [];
      var thisp = arguments[1];
      for (var i in objects) {
        if (objects.hasOwnProperty(i)) {
          if (fun.call(thisp, objects[i], i, objects)) {
            res.push(objects[i]);
          }
        }
      }

      return res;
    };

    __exports__.o_create = o_create;
    __exports__.addEventListener = addEventListener;
    __exports__.removeEventListener = removeEventListener;
    __exports__.a_forEach = a_forEach;
    __exports__.a_reduce = a_reduce;
    __exports__.a_map = a_map;
    __exports__.a_indexOf = a_indexOf;
    __exports__.a_filter = a_filter;
  });
define("oasis/util",
  ["oasis/shims","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var o_create = __dependency1__.o_create;
    var a_filter = __dependency1__.a_filter;

    function assert(assertion, string) {
      if (!assertion) {
        throw new Error(string);
      }
    }

    function noop() { }

    function mustImplement(className, name) {
      return function() {
        throw new Error("Subclasses of " + className + " must implement " + name);
      };
    }

    function extend(parent, object) {
      function OasisObject() {
        parent.apply(this, arguments);
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        }
      }

      OasisObject.prototype = o_create(parent.prototype);

      for (var prop in object) {
        if (!object.hasOwnProperty(prop)) { continue; }
        OasisObject.prototype[prop] = object[prop];
      }

      return OasisObject;
    }

    function delegate(delegateeProperty, delegatedMethod) {
      return function () {
        var delegatee = this[delegateeProperty];
        return delegatee[delegatedMethod].apply(delegatee, arguments);
      };
    }

    function uniq() {
      var seen = {};
      return a_filter.call(this, function (item) {
        var _seen = !seen.hasOwnProperty(item);
        seen[item] = true;
        return _seen;
      });
    }

    function reverseMerge(a, b) {
      for (var prop in b) {
        if (!b.hasOwnProperty(prop)) { continue; }

        if (! (prop in a)) {
          a[prop] = b[prop];
        }
      }

      return a;
    }

    __exports__.assert = assert;
    __exports__.noop = noop;
    __exports__.mustImplement = mustImplement;
    __exports__.extend = extend;
    __exports__.delegate = delegate;
    __exports__.uniq = uniq;
    __exports__.reverseMerge = reverseMerge;
  });
define("oasis/version",
  [],
  function() {
    "use strict";

    return '0.4.0';
  });
define("oasis/webworker_adapter",
  ["oasis/util","oasis/shims","rsvp","oasis/logger","oasis/base_adapter"],
  function(__dependency1__, __dependency2__, RSVP, Logger, BaseAdapter) {
    "use strict";
    var assert = __dependency1__.assert;
    var extend = __dependency1__.extend;
    var a_forEach = __dependency2__.a_forEach;
    var addEventListener = __dependency2__.addEventListener;
    var removeEventListener = __dependency2__.removeEventListener;
    /*global self, postMessage, importScripts, UUID */



    var WebworkerAdapter = extend(BaseAdapter, {
      type: 'js',

      //-------------------------------------------------------------------------
      // Environment API

      initializeSandbox: function(sandbox) {
        var worker = new Worker(sandbox.options.url);
        worker.name = sandbox.options.url + '?uuid=' + UUID.generate();
        sandbox.worker = worker;

        // Error handling inside the worker
        worker.errorHandler = function(event) {
          if(!event.data.sandboxException) {return;}

          sandbox.onerror( event.data.sandboxException );
        };
        addEventListener(worker, 'message', worker.errorHandler);

        sandbox._waitForLoadDeferred().resolve(new RSVP.Promise( function(resolve, reject) {
          worker.initializationHandler = function (event) {
            sandbox.oasis.configuration.eventCallback(function () {
              if( event.data !== sandbox.adapter.sandboxInitializedMessage ) {return;}
              removeEventListener(worker, 'message', worker.initializationHandler);

              Logger.log("worker sandbox initialized");
              resolve(sandbox);
            });
          };
          addEventListener(worker, 'message', worker.initializationHandler);
        }));

        worker.loadHandler = function (event) {
          sandbox.oasis.configuration.eventCallback(function () {
            if( event.data !== sandbox.adapter.oasisLoadedMessage ) {return;}
            removeEventListener(worker, 'message', worker.loadHandler);

            Logger.log("worker sandbox initialized");
            sandbox.createAndTransferCapabilities();
          });
        };
        addEventListener(worker, 'message', worker.loadHandler);
      },

      startSandbox: function(sandbox) { },

      terminateSandbox: function(sandbox) {
        var worker = sandbox.worker;

        removeEventListener(worker, 'message', worker.loadHandler);
        removeEventListener(worker, 'message', worker.initializationHandler);
        sandbox.worker.terminate();
      },

      connectPorts: function(sandbox, ports) {
        var rawPorts = ports.map(function(port) { return port.port; }),
            message = this.createInitializationMessage(sandbox);

        Worker.postMessage(sandbox.worker, message, rawPorts);
      },

      connectSandbox: function(oasis) {
        return BaseAdapter.prototype.connectSandbox.call(this, self, oasis);
      },

      //-------------------------------------------------------------------------
      // Sandbox API

      name: function(sandbox) {
        return sandbox.worker.name;
      },

      oasisLoaded: function() {
        postMessage(this.oasisLoadedMessage, []);
      },

      didConnect: function() {
        postMessage(this.sandboxInitializedMessage, []);
      }
    });


    return WebworkerAdapter;
  });
define("oasis/xhr",
  ["oasis/util","rsvp","exports"],
  function(__dependency1__, RSVP, __exports__) {
    "use strict";
    var noop = __dependency1__.noop;
    /*global XDomainRequest */


    var a_slice = Array.prototype.slice;

    function acceptsHeader(options) {
      var dataType = options.dataType;

      if (dataType && accepts[dataType]) {
        return accepts[dataType];
      }

      return accepts['*'];
    }

    function xhrSetRequestHeader(xhr, options) {
      xhr.setRequestHeader("Accepts", acceptsHeader(options));
    }

    function xhrGetLoadStatus(xhr) {
      return xhr.status;
    }

    function xdrGetLoadStatus() {
      return 200;
    }

    var NONE = {};

    function trigger(event, oasis) {
      if (!oasis) { return; }

      var args = a_slice.call(arguments, 2);

      args.unshift(event);
      oasis.trigger.apply(oasis, args);
    }

    var accepts = {
      "*": "*/*",
      text: "text/plain",
      html: "text/html",
      xml: "application/xml, text/xml",
      json: "application/json, text/javascript"
    };

    var XHR, setRequestHeader, getLoadStatus, send;

    try {
      if ('withCredentials' in new XMLHttpRequest()) {
        XHR = XMLHttpRequest;
        setRequestHeader = xhrSetRequestHeader;
        getLoadStatus = xhrGetLoadStatus;
      } else if (typeof XDomainRequest !== 'undefined') {
        XHR = XDomainRequest;
        setRequestHeader = noop;
        getLoadStatus = xdrGetLoadStatus;
      }
    } catch( exception ) {
      if (typeof XDomainRequest !== 'undefined') {
        XHR = XDomainRequest;
        setRequestHeader = noop;
        getLoadStatus = xdrGetLoadStatus;
      }
    }
    // else inline adapter with cross-domain cards is not going to work


    function xhr(url, options, oasis) {
      if (!oasis && this instanceof Oasis) { oasis = this; }
      if (!options) { options = NONE; }

      return new RSVP.Promise(function(resolve, reject){
        var xhr = new XHR();
        xhr.open("get", url, true);
        setRequestHeader(xhr, options);

        if (options.timeout) {
          xhr.timeout = options.timeout;
        }

        xhr.onload = function () {
          trigger('xhr.load', oasis, url, options, xhr);

          var status = getLoadStatus(xhr);
          if (status >= 200 && status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(xhr);
          }
        };

        xhr.onprogress = noop;
        xhr.ontimeout = function () {
          trigger('xhr.timeout', oasis, url, options, xhr);
          reject(xhr);
        };

        xhr.onerror = function () {
          trigger('xhr.error', oasis, url, options, xhr);
          reject(xhr);
        };

        trigger('xhr.send', oasis, url, options, xhr);
        xhr.send();
      });
    }

    __exports__.xhr = xhr;
  });self.Oasis = requireModule('oasis'); self.oasis = new self.Oasis(); self.oasis.autoInitializeSandbox();
//environment
var ProtoEmbed = {};
ProtoEmbed.init = {};
ProtoEmbed.init = function (id, url, mode){
  console.log(id, url, "------")
  // $(function(){
  //   $('#' +id + ' iframe').ready(function(){
  //     document.getElementById("cite").remove();
  //   });
  // });
  window.onload = function(){
    document.getElementById("cite").parentNode.removeChild(document.getElementById("cite"));
  }
  var ResizeService = Oasis.Service.extend({
    initialize: function() {
      this.request('receive', mode).then(function (data) {
        resizeIframe(document.querySelector('#' + id + ' iframe'), data)
      });
    },
    events: {
      resize_frame: function(data){
        resizeIframe(document.querySelector('#' + id + ' iframe'), data)
      }
    }
  });
  var sandbox = oasis.createSandbox({
    url: url,
    type: 'html',
    capabilities: [ 'receive' ],
    services: {
      receive: ResizeService
    }
  });
  document.getElementById(id).append(sandbox.el);
  document.querySelector('#' + id + ' iframe').style.width = '100%'
  document.querySelector('#' + id + ' iframe').style.height = 'auto'
  document.querySelector('#' + id + ' iframe').style.borderWidth = '0px'
  // $("#" +id).find('iframe').css({
  //   "width": '100%',
  //   "height": 'auto',
  //   'border-width': '0px'
  // })
  // document.getElementsByClassName("pyk-button").click(function(){
  //   let mode = this.id;
  //   oasis.services[0].send("resize_content", mode)
  // })
  function buttonClicked() {
    let mode = this.id;
    oasis.services[0].send("resize_content", mode)
  }

  var button_class = document.getElementsByClassName("pyk-button")
  for (let i=0; i<button_class.length; i++){
    button_class[i].setAttribute('style', 'background-color: white; border: 1px solid grey;color: black;padding: 5px;text-align: center;text-decoration: none;display: inline-block;font-size: 12px;cursor:pointer')
    button_class[i].addEventListener('click', buttonClicked)
  }

  function resizeIframe(obj, data) {
    console.log(obj, data, "iframe object")
    if (data !== undefined) {
      // obj[0].style.height = obj.context.body.scrollHeight + 'px';
      obj.style.height = data.height + 'px';
      obj.style.width = '100%';
    }
  }
}