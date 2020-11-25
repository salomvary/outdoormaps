import $ from './util';
import * as L from 'leaflet';
import { getAccurateCurrentPosition } from './vendor/geolocation';
import { MapPlugin } from './map-plugin';
import Map, { MapButton } from './map';
import StateStore from './state-store';

const myLocationIcon = L.divIcon({
  iconSize: [20, 20],
  className: 'my-location-icon',
});

export default class ShowPosition implements MapPlugin {
  private controller: Map;
  private options: StateStore;
  private map: L.Map;
  private button: MapButton;
  private moved: boolean;
  private locating: boolean;
  private automoving: boolean;
  private marker: L.Marker;

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;
  }

  setMap(map: L.Map) {
    if (navigator.geolocation) {
      this.map = map;
      this.button = this.controller.createButton(
        'locate',
        'topleft',
        this.showCurrentPosition,
        this
      );
      this.map.on('movestart zoomstart', this.viewChanged.bind(this));
    }
    if (this.options.get('position')) {
      this.setMarker(this.options.get('position'));
    }
  }

  showCurrentPosition() {
    this.moved = false;
    // show the last known position, if any
    const lastPosition = this.options.get('position');
    if (lastPosition) {
      this.showPosition(lastPosition);
    }

    // update the position
    if (!this.locating) {
      this.locating = true;
      $.toggleClass(this.button.getContainer()!, 'busy-button', true);
      getAccurateCurrentPosition(
        this.positionUpdate.bind(this, false),
        this.positionError.bind(this),
        this.positionUpdate.bind(this, true),
        { desiredAccuracy: 100, maxWait: 20000 }
      );
    }
  }

  viewChanged() {
    // ignore events fired by calls to
    // setView/panTo below
    if (!this.automoving) {
      this.moved = true;
    }
  }

  positionError(error: Error) {
    this.locating = false;
    $.toggleClass(this.button.getContainer()!, 'busy-button', false);
    alert('Could not get your position: ' + error.message);
  }

  positionUpdate(progress: boolean, position: Position) {
    if (!progress) {
      this.locating = false;
      $.toggleClass(this.button.getContainer()!, 'busy-button', false);
    }
    const center = new L.LatLng(
      position.coords.latitude,
      position.coords.longitude
    );
    this.showPosition(center);
  }

  showPosition(center: L.LatLngExpression) {
    // update marker position
    this.setMarker(center);

    // if the user hasn't moved the map,
    // reposition it to show the position
    if (!this.moved) {
      this.automoving = true;
      if (this.map.getZoom() < 15) {
        this.map.setView(center, 15);
      } else {
        this.map.panTo(center);
      }
      this.automoving = false;
    }

    this.options.set('position', center);
    this.options.save();
  }

  setMarker(position: L.LatLngExpression) {
    if (this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = this.controller.addMarker(position, {
        icon: myLocationIcon,
      });
    }
  }
}
