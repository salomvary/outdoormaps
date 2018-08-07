var $ = require('util'),
    klass = require('vendor/klass'),
    L = require('vendor/leaflet'),
    RoutingPanel = require('routing-panel'),
    gpxExport = require('gpx-export');

require('vendor/leaflet-routing-machine');

// MapBox API key
var apiKey = 'pk.eyJ1Ijoic2Fsb212YXJ5IiwiYSI6ImNpcWI1Z21lajAwMDNpMm5oOGE4ZzFzM3YifQ.DqyC3wn8ChEjcztfbY0l_g';

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;
    this.panel = new RoutingPanel({
      onClear: this.onClear.bind(this),
      onClose: this.onClose.bind(this),
      onExport: this.onExport.bind(this)
    });
  },

  setMap: function(map) {
    this.map = map;
    this.button = this.controller.createButton('directions', 'topleft',
      this.toggleRouting, this);
  },

  onMapClick: function(e) {
    this.addWaypoint(e.latlng);
  },

  onClear: function() {
    this.panel.setStats({});
    this.routingControl.setWaypoints([]);
  },

  onClose: function() {
    this.hide();
  },

  onRouteSelected: function(itinerary) {
    this.selectedItinerary = itinerary;
    this.panel.setStats(itinerary.route.summary);
  },

  onContextMenu: function(i, event) {
    var deleteButton = $.create('button', 'delete-button');
    $.on(deleteButton, 'click', this.onDeleteWaypointClick.bind(this, i));
    deleteButton.innerHTML = '&nbsp;';

    L.popup({offset: [0, -31]})
      .setLatLng(event.latlng)
      .setContent(deleteButton)
      .openOn(this.map);
  },

  onDeleteWaypointClick: function(i) {
    this.map.closePopup();
    this.removeWaypoint(i);
  },

  onExport: function() {
    gpxExport(this.selectedItinerary.route.coordinates);
  },

  toggleRouting: function() {
    if (!this.active) {
      this.show();
    } else {
      this.hide();
    }
  },

  show: function() {
    if (!this.active) {
      this.active = true;
      this.togglePanel(true);
      this.routingControl = L.Routing.control({
        router: L.Routing.mapbox(apiKey),
        // Hide itinerary for now (there is no better way)
        summaryTemplate: '',
        itineraryBuilder: noOpItineraryBuilder,
        createMarker: this.createMarker.bind(this)
      }).addTo(this.map);
      this.map.on('click', this.onMapClick, this);
      this.routingControl.on('routeselected', this.onRouteSelected, this);
    }
  },

  hide: function() {
    if (this.active) {
      this.active = false;
      this.togglePanel(false);
      this.routingControl.remove();
      this.routingControl = null;
      this.map.off('click', this.onMapClick, this);
    }
  },

  togglePanel: function(active) {
    $.toggleClass(document.body, 'routing-panel-active', active);
  },

  createMarker: function(i, waypoint) {
    return L.marker(waypoint.latLng, {
      draggable: true
    }).on('contextmenu', this.onContextMenu.bind(this, i));
  },

  removeWaypoint: function(i) {
    this.routingControl.spliceWaypoints(i, 1);
  },

  addWaypoint: function(latlng) {
    var currentWaypoints = this.routingControl.getWaypoints();
    // Sadly, the initial state is two waypoints with undefined latlng
    if (currentWaypoints.length > 0 && !currentWaypoints[0].latLng) {
      // Replace the first undefined one
      this.routingControl.spliceWaypoints(0, 1, latlng);
    } else if (currentWaypoints.length > 1 && !currentWaypoints[1].latLng) {
      // Replace the second undefined one
      this.routingControl.spliceWaypoints(1, 1, latlng);
    } else {
      // Apped third or later one
      this.routingControl.spliceWaypoints(currentWaypoints.length, 0, latlng);
    }
  }
});

var noOpItineraryBuilder = {
  createContainer: function() {
    return document.createElement('span');
  },

  createStepsContainer: function() {
    return document.createElement('span');
  },

  createStep: function() {
    return document.createElement('span');
  }
};
