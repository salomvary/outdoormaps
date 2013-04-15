module.exports.isEnabled = function(flag) {
  return window.localStorage && localStorage[flag + 'Enabled'];
};
