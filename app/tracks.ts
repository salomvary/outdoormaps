import klass from 'klass';
import GPX from 'leaflet-plugins/layer/vector/GPX';
import Promise from './promise';

var DROPBOX_URL = new RegExp('https?://(?:www\\.dropbox\\.com|dl\\.dropboxusercontent\\.com)/s/([^/]+)/([^/]+)');

export default klass({
  initialize: function() {
    this.mapAvailable = new Promise(function(resolve) {
      this.resolveMap = resolve;
    }.bind(this));
  },

  route: function(path) {
    var trackUrl = parseLocation(path);
    if (this.track) {
      this.hideTrack();
    }
    if (trackUrl) {
      this.loadTrack(trackUrl);
      return true;
    }
  },

  loadTrack: function(url) {
    var track = this.track = new GPX(url, {async: true});
    var trackLoaded = new Promise(track.on.bind(track, 'loaded'));
    this.mapAvailable
      .then(function() { return trackLoaded; })
      .then(this.showTrack.bind(this));
  },

  setMap: function(map) {
    this.map = map;
    this.resolveMap();
  },

  showTrack: function(event) {
    this.map
      .fitBounds(event.target.getBounds())
      .addLayer(this.track);
  },

  hideTrack: function() {
    this.map.removeLayer(this.track);
    this.track = null;
  }
});

function parseLocation(path) {
  var match = DROPBOX_URL.exec(path);
  return match && dropboxUrl(match[1], match[2]);
}

function dropboxUrl(hash, filename) {
  return 'https://dl.dropboxusercontent.com/s/' + hash + '/' + filename;
}
