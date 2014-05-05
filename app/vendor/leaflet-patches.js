define(function(require, exports, module){

var L = require('vendor/leaflet'),
    _createTile = L.TileLayer.prototype._createTile;


// fix ugly lack of png antialiasing on iOS
// (can go once 0.8 gets released)
L.TileLayer.prototype._createTile = function() {
  var tile = _createTile.apply(this, arguments);

  if (L.Browser.android && !L.Browser.android23) {
    tile.style.WebkitBackfaceVisibility = 'hidden';
  } else {
    tile.style.WebkitBackfaceVisibility = 'visible';
  }

  return tile;
};

});
