import * as L from 'leaflet';
import Map from './map';
import StateStore from './state-store';
import { MapPlugin } from './map-plugin';

export default class InitialLocation implements MapPlugin {
  private promise: Promise<void> | void;

  constructor(
    controller: Map,
    options: StateStore
  ) {
    // get initial location if not saved from a previous session
    if (!options.get('center') && navigator.geolocation) {
      this.promise = new Promise<void>(function(resolve) {
        navigator.geolocation.getCurrentPosition(function(position) {
          // success
          options.set('center', new L.LatLng(
            position.coords.latitude,
            position.coords.longitude));
          resolve();
        }, function() {
          // error
          resolve();
        });
      });
    }
  }

  beforeMap() {
    return this.promise;
  }
}
