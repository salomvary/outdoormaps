import GPX from 'leaflet-plugins/layer/vector/GPX';
import { MapPlugin } from './map-plugin';

var DROPBOX_URL = new RegExp('https?://(?:www\\.dropbox\\.com|dl\\.dropboxusercontent\\.com)/s/([^/]+)/([^/]+)');

export default class Tracks implements MapPlugin {
  private map: L.Map
  private mapAvailable: Promise<void>
  private track: GPX
  private resolveMap: () => void

  constructor() {
    this.mapAvailable = new Promise(function(resolve: () => void) {
      this.resolveMap = resolve;
    }.bind(this));
  }

  route(path: string) {
    var trackUrl = parseLocation(path);
    if (this.track) {
      this.hideTrack();
    }
    if (trackUrl) {
      this.loadTrack(trackUrl);
      return true;
    }
  }

  private loadTrack(url: string) {
    var track = this.track = new GPX(url, {async: true});
    var trackLoaded = new Promise(track.on.bind(track, 'loaded'));
    this.mapAvailable
      .then(function() { return trackLoaded; })
      .then(this.showTrack.bind(this));
  }

  setMap(map: L.Map) {
    this.map = map;
    this.resolveMap();
  }

  private showTrack(event) {
    this.map
      .fitBounds(event.target.getBounds())
      .addLayer(this.track);
  }

  private hideTrack() {
    this.map.removeLayer(this.track);
    this.track = null;
  }
}

function parseLocation(path: string) {
  var match = DROPBOX_URL.exec(path);
  return match && dropboxUrl(match[1], match[2]);
}

function dropboxUrl(hash: string, filename: string) {
  return 'https://dl.dropboxusercontent.com/s/' + hash + '/' + filename;
}
