var $ = require('./util'),
    Events = require('leaflet').Mixin.Events,
    currentHash;

var Location = module.exports = $.extend({
  get: function() {
    return window.location.hash.substring(1);
  },

  set: function(hash) {
    currentHash = hash;
    window.location.hash = hash;
  }
}, Events);

$.on(window, 'hashchange', onHashChange);
currentHash = Location.get();

function onHashChange() {
  if (Location.get() !== currentHash) {
    Location.fire('change');
  }
  currentHash = Location.get();
}
