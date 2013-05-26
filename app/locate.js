var L = require('vendor/leaflet');

var controller,
    map;

module.exports = function(_controller) {
  controller = _controller;
  map = controller.map;

  if(navigator.geolocation) {
    controller.createButton('locate', 'topleft', getCurrentPosition);
  }
};

function getCurrentPosition() {
  navigator.geolocation.getAccurateCurrentPosition(showPosition, positionError,
                                                   showPosition, {desiredAccuracy:10, maxWait: 20000});
}

function positionError(error) {
  alert('Could not get your position: ' + error.message);
}

function showPosition(position) {
  var center = new L.LatLng(position.coords.latitude, position.coords.longitude);
  controller.setMarker(center);
  if(map.getZoom() < 15) {
    map.setView(center, 15);
  } else {
    map.panTo(center);
  }
  controller.saveState();
}
