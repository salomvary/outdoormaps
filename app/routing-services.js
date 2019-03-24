var L = require('vendor/leaflet');

require('vendor/leaflet-routing-machine');
require('vendor/L.Routing.GraphHopper');

var mapboxKey = 'pk.eyJ1Ijoic2Fsb212YXJ5IiwiYSI6ImNpcWI1Z21lajAwMDNpMm5oOGE4ZzFzM3YifQ.DqyC3wn8ChEjcztfbY0l_g';
var graphHopperKey = 'cd462023-b872-4db6-b5cd-aad62847c8b7';

var routingServices = {};

routingServices.mapbox = {
  title: 'MapBox',
  vehicles: {
    car: {
      title: 'Drive',
      profile: 'mapbox/driving'
    },
    walk: {
      title: 'Walk',
      profile: 'mapbox/walking'
    },
    bike: {
      title: 'Bike',
      profile: 'mapbox/cycling'
    }
  },
  create: function(vehicle) {
    var profile = this.vehicles[vehicle].profile;
    return L.Routing.mapbox(mapboxKey, {
      profile: profile
    });
  },
  updateVehicle: function(router, vehicle) {
    router.options.profile = this.vehicles[vehicle].profile;
  }
};

routingServices.graphhopper = {
  title: 'GraphHopper',
  vehicles: {
    car: {
      title: 'Drive',
      vehicle: 'car'
    },
    walk: {
      title: 'Walk',
      vehicle: 'foot'
    },
    bike: {
      title: 'Bike',
      vehicle: 'bike'
    }
  },
  create: function(vehicle) {
    var vehicleParam = this.vehicles[vehicle].vehicle;
    return L.Routing.graphHopper(graphHopperKey, {
      urlParameters: {
        vehicle: vehicleParam
        // elevation: true,
        // points_encoded: false
      }
    });
  },
  updateVehicle: function(router, vehicle) {
    var vehicleParam = this.vehicles[vehicle].vehicle;
    router.options.urlParameters.vehicle = vehicleParam;
  }
};

Object.keys(routingServices).forEach(function(id) {
  routingServices[id].id = id;
});

exports.get = function(id) {
  return routingServices[id];
};

exports.keys = function() {
  return Object.keys(routingServices);
};
