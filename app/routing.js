var $ = require('util'),
    klass = require('vendor/klass'),
    L = require('vendor/leaflet'),
    RoutingPanel = require('routing-panel'),
    RoutingSettings = require('routing-settings'),
    routingServices = require('routing-services'),
    gpxExport = require('gpx-export');

require('vendor/leaflet-routing-machine');

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
    this.routingVehicle = options.get('routingVehicle') || 'bike';
    this.routingService = options.get('routingService') || 'mapbox';
    this.panel = new RoutingPanel({
      vehicles: this.getVehicles(),
      routingVehicle: this.routingVehicle,
      onClear: this.onClear.bind(this),
      onClose: this.onClose.bind(this),
      onExport: this.onExport.bind(this),
      onSettings: this.onSettings.bind(this),
      onVehicleChange: this.onVehicleChange.bind(this)
    });
    this.settings = new RoutingSettings({
      routingService: this.routingService,
      onRoutingServiceChange: this.onRoutingServiceChange.bind(this)
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

  onSettings: function() {
    this.settings.toggle();
  },

  onWaypointsChanged: function() {
    this.saveWaypoints();
  },

  getVehicles: function() {
    var vehicles = routingServices.get(this.routingService).vehicles;
    return Object.keys(vehicles)
      .reduce(function(acc, key) {
        acc[key] = vehicles[key].title;
        return acc;
      }, {});
  },

  onVehicleChange: function(value) {
    this.routingVehicle = value;
    this.options.set('routingVehicle', this.routingVehicle);
    this.updateRoutingVehicle();
    this.routingControl.route();
  },

  onRoutingServiceChange: function(value) {
    this.routingService = value;
    this.options.set('routingService', this.routingService);
    this.updateRoutingService();
    this.routingControl.route();
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
      this.addRoutingControl();
      this.map.on('click', this.onMapClick, this);
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

  addRoutingControl: function() {
    var routingService = routingServices.get(this.routingService);
    var router = routingService.create(this.routingVehicle);
    this.routingControl = L.Routing.control({
      waypoints: this.options.get('routingWaypoints'),
      router: router,
      // Hide itinerary for now (there is no better way)
      summaryTemplate: '',
      itineraryBuilder: noOpItineraryBuilder,
      createMarker: this.createMarker.bind(this),
      fitSelectedRoutes: false
    }).addTo(this.map);
    this.routingControl.on('routeselected', this.onRouteSelected, this);
    this.routingControl.on('waypointschanged', this.onWaypointsChanged, this);
  },

  updateRoutingVehicle: function() {
    var routingService = routingServices.get(this.routingService);
    var router = this.routingControl.getRouter();
    routingService.updateVehicle(router, this.routingVehicle);
  },

  updateRoutingService: function() {
    var routingService = routingServices.get(this.routingService);
    var router = routingService.create(this.routingVehicle);
    // _router is a "private" property but updating it seems to be fine
    this.routingControl._router = router;
  },

  createMarker: function(i, waypoint) {
    return L.marker(waypoint.latLng, {
      icon: i === 0 ? routeStartIcon : routeWaypointIcon,
      draggable: true
    })
      .on('contextmenu', this.onContextMenu.bind(this, i))
      .on('click', function(e) {
        // Prevent adding a route point when a marker is clicked
        e.originalEvent.stopPropagation();
      });
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
