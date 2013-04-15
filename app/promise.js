/**
 * Lightweight promise implementation
 * original idea: https://gist.github.com/814052
 *
 * Limitations: 
 * - Only one then() call per promise
 * - single argument to resove/reject
 */
var Promise = module.exports = function() {
	if(! (this instanceof Promise)) {
		return new Promise();
	}
};

Promise.prototype = {
	/**
	 * @param {Function} [resolve]
	 * @param {Function} [reject]
	 * @param {Function} [progress]
	 * @returns {Promise} for chaining then()
	 */
	then: function (resolve, reject, progress) {
		this.listener = {
			resolve: resolve, 
			reject: reject,
			progress: progress,
			promise: new Promise()
		};
		return this.listener.promise;
	},

	progress: function() {
		if(this.listener.progress) {
			this.listener.progress.apply(this, arguments);
		}
	},

	resolve: function (val) { 
		this._done('resolve', val); 
	},

	reject: function (ex) { 
		this._done('reject', ex); 
	},

	_done: function (which, arg) {
		this.then = function (resolve, reject) { 
			return this._chain({
				resolve: resolve,
				reject: reject
			}, which, arg); 
		};
		this.resolve = this.reject = 
			function () { throw new Error('Promise already completed.'); };
		if(this.listener) {
			this._chain(this.listener, which, arg);
		}
	},

	_chain: function(listener, which, arg) {
		var next = listener[which] && listener[which](arg);
		if(! listener.promise) {
			listener.promise = new Promise();
		}
		if(next && next.then) {
			return next.then(
				listener.promise.resolve.bind(listener.promise),
				listener.promise.reject.bind(listener.promise));
		} else {
			listener.promise[which](arg);
			return listener.promise;
		}
	}
	
};
