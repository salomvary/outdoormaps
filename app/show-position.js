var klass = require('vendor/klass'),
    L = require('vendor/leaflet');

module.exports = klass({
  initialize: function(controller) {
    this.controller = controller;
  },

  setMap: function(map) {
    if(navigator.geolocation) {
      this.map = map;
      this.controller.createButton('locate', 'topleft',
        this.getCurrentPosition, this);
    }
  },

  getCurrentPosition: function() {
    navigator.geolocation.getAccurateCurrentPosition(
      this.showPosition.bind(this),
      this.positionError.bind(this),
      this.showPosition.bind(this),
      {desiredAccuracy:10, maxWait: 20000});
  },

  positionError: function(error) {
    alert('Could not get your position: '+error.message);
  },

  showPosition: function(position) {
    var center = new L.LatLng(position.coords.latitude,
      position.coords.longitude);
    this.controller.addMarker(center);
    if(this.map.getZoom() < 15) {
      this.map.setView(center, 15);
    } else {
      this.map.panTo(center);
    }
    //saveState();
  }
});

