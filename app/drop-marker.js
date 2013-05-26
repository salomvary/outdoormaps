var klass = require('vendor/klass');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;
    options.set(this.loadHashState());
  },

  setMap: function(map) {
    this.map = map;
    map.on('contextmenu', this.dropMarker, this);
    var marker = this.options.get('marker');
    if(marker) {
      this.setMarker(marker);
    }
  },

  loadHashState: function() {
    var state = {};
    if(window.location.hash.length > 1) {
      var parts = window.location.hash.substring(1).split(',');
      try {
        state.center = {
          lat: parseFloat(parts[0]),
          lng: parseFloat(parts[1])
        };
        state.zoom = parseInt(parts[2], 10);
      } catch(e) { /* invalid hash, ignore it */ }
      state.marker = state.center;
    }
    return state;
  },

  dropMarker: function(event) {
    this.setMarker(event.latlng);
    this.saveHashState(event.latlng);
  },

  saveHashState: function(position) {
    window.location.hash =
      roundCoordinate(position.lat) + ',' +
      roundCoordinate(position.lng) + ',' +
      this.map.getZoom();
  },

  setMarker: function(position) {
    if(! this.marker) {
      this.marker = this.controller.addMarker(position);
    } else {
      this.marker.setLatLng(position);
    }
  },

  getState: function() {
    if(this.marker) {
      return { marker: this.marker.getLatLng() };
    }
  }
});

function roundCoordinate(coordinate) {
  return Math.round(coordinate * 100000) / 100000;
}
