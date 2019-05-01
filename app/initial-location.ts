import * as L from 'leaflet';
import Map from './map';
import StateStore from './state-store';

export default function(controller: Map, options: StateStore) {
  // get initial location if not saved from a previous session
  if (!options.get('center') && navigator.geolocation) {
    return new Promise<void>(function(resolve) {
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
