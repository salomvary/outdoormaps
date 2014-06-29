var klass = require('vendor/klass'),
    GPX = require('vendor/GPX'),
    Promise = require('promise');

var DROPBOX_URL = new RegExp('https?://(?:www\\.dropbox\\.com|dl\\.dropboxusercontent\\.com)/s/([^/]+)/([^/]+)');

module.exports = klass({
  route: function(path) {
    var trackUrl = parseLocation(path);
    if (trackUrl) {
      this.loadTrack(trackUrl);
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

function parseLocation(path) {
  var match = DROPBOX_URL.exec(path);
  return match && dropboxUrl(match[1], match[2]);
}

function dropboxUrl(hash, filename) {
  return 'https://dl.dropboxusercontent.com/s/' + hash + '/' + filename;
}
