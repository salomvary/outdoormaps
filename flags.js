define(function(require, exports, module) {

	module.exports.isEnabled = function(flag) {
		return window.localStorage && localStorage[flag + 'Enabled'];
	};

});
