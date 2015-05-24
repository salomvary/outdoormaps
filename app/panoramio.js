var L = require('vendor/leaflet'),
    jsonp = require('vendor/jsonp');

module.exports = L.FeatureGroup.extend({
	onAdd: function(map) {
		map.on('moveend', this._update, this);
		this._map = map;
    this._update();
	},

	onRemove: function(map) {
		map.off('moveend', this._update, this);
    this.clearLayers();
	},

  _removeMarkers: function() {
    this.getLayers()
      .filter(function(layer) {
        // keep markers with open popup
        return !this._map.hasLayer(layer.getPopup());
      }, this)
      .forEach(this.removeLayer, this);
  },

	_load: function(data) {
    this._removeMarkers();

    data
      .photos
      .map(function(photo) {
        var icon = L.divIcon({
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -10],
          className: 'panoramio-icon'
        });

        var marker = L.marker([photo.latitude, photo.longitude], {icon: icon})
          .bindPopup(this._template(photo), {
            maxWidth: photo.width,
            // avoid popup under top controls:
            autoPanPaddingTopLeft: [0, 60],
            className: 'photo-popup'
          });

        return marker;
      }, this)
      .forEach(this.addLayer, this);
	},

  _template: function(data) {
    var template =
      '<b class="title">{photo_title}</b>' +
      '<a href="{photo_url}" target="_blank">' +
        '<img class="photo" src="{photo_file_url}" alt="{photo_title}" width="{width}" height="{height}">' +
      '</a>' +
      '<img class="logo" src="http://www.panoramio.com/img/logo-tos.png">' +
      '<a class="owner" href="{owner_url}" target="_blank">{owner_name}</a>';
    return L.Util.template(template, data);
  },

	_update: function() {
		var bounds = this._map.getBounds();
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
    var size = this._map.getSize();
    var magic = 7500;

    // Limit is proportional to map size on the screen:
    // ~15 on mobile screens, ~100 on large desktop screens
    var limit = Math.max(10, Math.min(100, Math.round(size.x * size.y / magic)));

    jsonp({
      url: 'http://www.panoramio.com/map/get_panoramas.php',
      data: {
        set: 'public',
        from: 0,
        to: limit,
        size: 'small',
        mapfilter: true,
        minx: sw.lng,
        miny: sw.lat,
        maxx: ne.lng,
        maxy: ne.lat
      },
      success: this._load.bind(this)
    });
	}
});
