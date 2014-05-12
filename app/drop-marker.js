var klass = require('vendor/klass'),
    Location = require('location');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;
    var state = Location.get();
    if (state.center) {
      options.set({marker: state.center});
    }
  },

  setMap: function(map) {
    this.map = map;
    map.on('contextmenu', this.dropMarker, this);
    var marker = this.options.get('marker');
    if(marker) {
      this.setMarker(marker);
    }
  },

  dropMarker: function(event) {
    this.setMarker(event.latlng);
    this.setLocation(event.latlng);
  },

  setLocation: function(position) {
    Location.set({
      center: position,
      zoom: this.map.getZoom()
    });
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
