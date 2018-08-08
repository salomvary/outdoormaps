var $ = require('util'),
    klass = require('vendor/klass'),
    L = require('vendor/leaflet'),
    RoutingPanel = require('routing-panel'),
    gpxExport = require('gpx-export');

require('vendor/leaflet-routing-machine');
require('vendor/L.Routing.GraphHopper');

// MapBox API key
var apiKey = 'pk.eyJ1Ijoic2Fsb212YXJ5IiwiYSI6ImNpcWI1Z21lajAwMDNpMm5oOGE4ZzFzM3YifQ.DqyC3wn8ChEjcztfbY0l_g';

var routeStartIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'route-start-icon'
});

var routeWaypointIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'route-waypoint-icon'
});

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
    if (this.options.get('routingActive')) {
      this.show();
    }
  },

  onMapClick: function(e) {
    this.addWaypoint(e.latlng);
  },

  onClear: function() {
    this.panel.setStats({});
    this.selectedRoute = null;
    this.routingControl.setWaypoints([]);
  },

  onClose: function() {
    this.hide();
  },

  onRouteSelected: function(event) {
    this.selectedRoute = event.route;
    this.panel.setStats(event.route.summary);
    this.options.save();
  },

  onContextMenu: function(i, event) {
    var deleteButton = $.create('button', 'delete-button');
    $.on(deleteButton, 'click', this.onDeleteWaypointClick.bind(this, i));
    deleteButton.innerHTML = '&nbsp;';

    L.popup({offset: [0, -2]})
      .setLatLng(event.latlng)
      .setContent(deleteButton)
      .openOn(this.map);
  },

  onDeleteWaypointClick: function(i) {
    this.map.closePopup();
    this.removeWaypoint(i);
  },

  onExport: function() {
    gpxExport(this.selectedRoute.coordinates);
  },

  onWaypointsChanged: function() {
    this.saveWaypoints();
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
        waypoints: this.options.get('routingWaypoints'),
        //router: L.Routing.mapbox(apiKey),
        router: L.Routing.graphHopper('cd462023-b872-4db6-b5cd-aad62847c8b7', {
          urlParameters: {
            vehicle: 'racingbike',
            // elevation: true,
            // points_encoded: false
          }
        }),
        // Hide itinerary for now (there is no better way)
        summaryTemplate: '',
        itineraryBuilder: noOpItineraryBuilder,
        createMarker: this.createMarker.bind(this)
      }).addTo(this.map);
      this.map.on('click', this.onMapClick, this);
      this.routingControl.on('routeselected', this.onRouteSelected, this);
      this.routingControl.on('waypointschanged', this.onWaypointsChanged, this);
      this.options.set('routingActive', this.active);
      this.options.save();
    }
  },

  hide: function() {
    if (this.active) {
      this.active = false;
      this.togglePanel(false);
      this.routingControl.remove();
      this.routingControl = null;
      this.map.off('click', this.onMapClick, this);
      this.options.set('routingActive', this.active);
      this.options.save();
    }
  },

  togglePanel: function(active) {
    $.toggleClass(document.body, 'routing-panel-active', active);
  },

  createMarker: function(i, waypoint) {
    return L.marker(waypoint.latLng, {
      icon: i === 0 ? routeStartIcon : routeWaypointIcon,
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
  },

  saveWaypoints: function() {
    var waypoints = this.routingControl.getWaypoints()
      .map(function(waypoint) {
        return waypoint.latLng;
      })
      // Empty state is two waypoints with null latLngs
      .filter(function(latLngs) {
        return !!latLngs;
      });
    this.options.set('routingWaypoints', waypoints);
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
