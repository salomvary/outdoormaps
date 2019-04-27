import Location from './location';
import Map from './map';
import StateStore from './state-store';

export default class DropMarker implements MapPlugin {
  controller: Map
  options: StateStore
  map: L.Map
  private marker: L.Marker

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;
  }

  setMap(map: L.Map) {
    this.map = map;
    map.on('contextmenu', this.dropMarker, this);
    var marker = this.options.get('marker');
    if (marker) {
      this.setMarker(marker);
    }
  }

  route(path) {
    var parts = path.split('/'),
      state: {zoom?: number; marker?: {}; layers?: string[]; center?: {}} = {};

    var layer = parts[0],
      lat = parseFloat(parts[1]),
      lng = parseFloat(parts[2]),
      zoom = parseInt(parts[3], 10);

    if (!(isNaN(lat) || isNaN(lng) || isNaN(zoom))) {
      state.marker = state.center = {
        lat: lat,
        lng: lng
      };
      state.zoom = zoom;
      state.layers = [layer];
      this.options.set(state);
      return true;
    }
  }

  dropMarker(event) {
    this.setMarker(event.latlng);
    this.setLocation(event.latlng);
  }

  setLocation(position) {
    Location.set(buildLocation({
      layers: this.options.get('layers'),
      center: position,
      zoom: this.map.getZoom()
    }));
  }

  setMarker(position) {
    if (!this.marker) {
      this.marker = this.controller.addMarker(position);
    } else {
      this.marker.setLatLng(position);
    }
  }

  getState() {
    if (this.marker) {
      return { marker: this.marker.getLatLng() };
    }
  }
}

function buildLocation(state) {
  return [
    state.layers[0],
    roundCoordinate(state.center.lat),
    roundCoordinate(state.center.lng),
    state.zoom
  ].join('/');
}

function roundCoordinate(coordinate) {
  return Math.round(coordinate * 100000) / 100000;
}
