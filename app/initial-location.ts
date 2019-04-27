import * as L from 'leaflet';

export default function(controller, options) {
  // get initial location if not saved from a previous session
  if (!options.get('center') && navigator.geolocation) {
    return new Promise(function(resolve) {
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
