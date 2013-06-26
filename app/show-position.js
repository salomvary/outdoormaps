var klass = require('vendor/klass'),
    L = require('vendor/leaflet'),
    geolocation = require('geolocation');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;
  },

  setMap: function(map) {
    if(navigator.geolocation) {
      this.map = map;
      this.controller.createButton('locate', 'topleft',
        this.showCurrentPosition, this);
      this.map.on('movestart zoomstart', this.viewChanged.bind(this));
    }
    if(this.options.get('position')) {
      this.setMarker(this.options.get('position'));
    }
  },

  showCurrentPosition: function() {
    this.moved = false;
    // show the last known position, if any
    var lastPosition = this.options.get('position');
    if(lastPosition) {
      this.showPosition(lastPosition);
    }

    // update the position
    if(! this.locating) {
      this.locating = true;
      geolocation.getAccurateCurrentPosition(
        this.positionUpdate.bind(this, false),
        this.positionError.bind(this),
        this.positionUpdate.bind(this, true),
        {desiredAccuracy:10, maxWait: 20000});
    }
  },

  viewChanged: function() {
    // ignore events fired by calls to
    // setView/panTo below
    if(! this.automoving) {
      this.moved = true;
    }
  },

  positionError: function(error) {
    this.locating = false;
    alert('Could not get your position: ' + error.message);
  },

  positionUpdate: function(progress, position) {
    if(! progress) {
      this.locating = false;
    }
    var center = new L.LatLng(position.coords.latitude,
      position.coords.longitude);
    this.showPosition(center);
  },

  showPosition: function(center) {
    // update marker position
    this.setMarker(center);

    // if the user hasn't moved the map,
    // reposition it to show the position
    if(! this.moved) {
      this.automoving = true;
      if(this.map.getZoom() < 15) {
        this.map.setView(center, 15);
      } else {
        this.map.panTo(center);
      }
      this.automoving = false;
    }

    this.options.set('position', center);
    this.options.save();
  },

  setMarker: function(position) {
    if(this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = this.controller.addMarker(position);
    }
  }
});

