var Promise = require('promise'),
    L = require('vendor/leaflet'),
    klass = require('vendor/klass');

module.exports = klass({
  initialize: function(controller, options) {
    // get initial location if not saved from a previous session
    if(! options.get('center') && navigator.geolocation) {
      var promise = this.promise = new Promise();

      navigator.geolocation.getCurrentPosition(function(position) {
        // success
        options.set('center', new L.LatLng(
          position.coords.latitude,
          position.coords.longitude));
        promise.resolve();
      }, function() {
        // error
        promise.resolve();
      });
    }
  }
});

