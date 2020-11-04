import * as L from 'leaflet';
import Location from './location';
import Map from './map';
import StateStore, { State } from './state-store';
import { MapPlugin } from './map-plugin';
import { LatLngExpression, LocationEvent, LatLngLiteral } from 'leaflet';

export default class DropMarker implements MapPlugin {
  controller: Map;
  options: StateStore;
  map: L.Map;
  private marker: L.Marker;

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

  route(path: string) {
    var parts = path.split('/'),
      state: State = {};

    var layer = parts[0],
      lat = parseFloat(parts[1]),
      lng = parseFloat(parts[2]),
      zoom = parseInt(parts[3], 10);

    if (!(isNaN(lat) || isNaN(lng) || isNaN(zoom))) {
      state.marker = state.center = {
        lat: lat,
        lng: lng,
      };
      state.zoom = zoom;
      state.layers = [layer];
      this.options.set(state);
      return true;
    }
  }

  private dropMarker(event: LocationEvent) {
    this.setMarker(event.latlng);
    this.setLocation(event.latlng);
  }

  private setLocation(position: LatLngLiteral) {
    Location.set(
      buildLocation({
        layers: this.options.get('layers'),
        center: position,
        zoom: this.map.getZoom(),
      })
    );
  }

  setMarker(position: LatLngExpression) {
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

function buildLocation(state: State) {
  return [
    state.layers[0],
    roundCoordinate(state.center.lat),
    roundCoordinate(state.center.lng),
    state.zoom,
  ].join('/');
}

function roundCoordinate(coordinate: number) {
  return Math.round(coordinate * 100000) / 100000;
}
