var klass = require('vendor/klass'),
    GPX = require('vendor/GPX'),
    Promise = require('promise');

module.exports = klass({
  route: function(path) {
    if (path.match(/^https?:\/\//)) {
      this.loadTrack(path);
      return true;
    }
  },

  loadTrack: function(url) {
    var track = this.track = new GPX(url, {async: true});
    this.trackLoaded = new Promise(track.on.bind(track, 'loaded'));
  },

  setMap: function(map) {
    this.map = map;
    if (this.trackLoaded) {
      this.trackLoaded.then(this.showTrack.bind(this));
    }
  },

  showTrack: function(event) {
    this.map
      .fitBounds(event.target.getBounds())
      .addLayer(this.track);
  }
});
