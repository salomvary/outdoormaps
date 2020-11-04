import { GraphHopper, Mapbox, Router } from '@salomvary/leaflet-minirouter';

interface RoutingServiceConfig {
  id?: string;
  title: string;
  vehicles: { [id: string]: { title: string; [key: string]: string } };
  create: (vehicle: string) => Router;
  updateVehicle: (router: Router, vehicle: string) => void;
}

const mapboxKey =
  'pk.eyJ1Ijoic2Fsb212YXJ5IiwiYSI6ImNpcWI1Z21lajAwMDNpMm5oOGE4ZzFzM3YifQ.DqyC3wn8ChEjcztfbY0l_g';
const graphHopperKey = 'cd462023-b872-4db6-b5cd-aad62847c8b7';

const routingServices: { [id: string]: RoutingServiceConfig } = {};

routingServices.mapbox = {
  title: 'MapBox',
  vehicles: {
    car: {
      title: 'Drive',
      profile: 'mapbox/driving',
    },
    walk: {
      title: 'Walk',
      profile: 'mapbox/walking',
    },
    bike: {
      title: 'Bike',
      profile: 'mapbox/cycling',
    },
  },
  create: function (vehicle) {
    const profile = this.vehicles[vehicle].profile;
    return new Mapbox(mapboxKey, {
      profile: profile,
    });
  },
  updateVehicle: function (router: Mapbox, vehicle) {
    router.profile = this.vehicles[vehicle].profile;
  },
};

routingServices.graphhopper = {
  title: 'GraphHopper',
  vehicles: {
    car: {
      title: 'Drive',
      vehicle: 'car',
    },
    walk: {
      title: 'Walk',
      vehicle: 'foot',
    },
    bike: {
      title: 'Bike',
      vehicle: 'bike',
    },
  },
  create: function (vehicle) {
    const vehicleParam = this.vehicles[vehicle].vehicle;
    return new GraphHopper(graphHopperKey, {
      urlParameters: {
        vehicle: vehicleParam,
        // elevation: true,
        // points_encoded: false
      },
    });
  },
  updateVehicle: function (router: GraphHopper, vehicle) {
    const vehicleParam = this.vehicles[vehicle].vehicle;
    router.urlParameters.vehicle = vehicleParam;
  },
};

Object.keys(routingServices).forEach(function (id) {
  routingServices[id].id = id;
});

export default {
  get(id: string) {
    return routingServices[id];
  },
  keys() {
    return Object.keys(routingServices);
  },
};
