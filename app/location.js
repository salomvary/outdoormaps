module.exports = {
  parse: function(path) {
    var parts = path.split(','),
        state = {};

    var lat = parseFloat(parts[0]),
        lng = parseFloat(parts[1]),
        zoom = parseInt(parts[2], 10);

    if (!(isNaN(lat) || isNaN(lng) || isNaN(zoom))) {
      state.center = {
        lat: lat,
        lng: lng
      };
      state.zoom = zoom;
    }

    return state;
  },

  serialize: function(state) {
    return roundCoordinate(state.center.lat) + ','
      + roundCoordinate(state.center.lng) + ','
      + state.zoom;
  },

  get: function() {
    return this.parse(window.location.hash.substring(1));
  },

  set: function(state) {
    window.location.hash = this.serialize(state);
  }
};

function roundCoordinate(coordinate) {
  return Math.round(coordinate * 100000) / 100000;
}
