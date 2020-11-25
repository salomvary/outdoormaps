import * as L from 'leaflet';
import 'leaflet-plugins/layer/vector/GPX';
import { MapPlugin } from './map-plugin';

const DROPBOX_URL = new RegExp(
  'https?://(?:www\\.dropbox\\.com|dl\\.dropboxusercontent\\.com)/s/([^/]+)/([^/]+)'
);

export default class Tracks implements MapPlugin {
  private map: L.Map;
  private mapAvailable: Promise<void>;
  private track: L.GPX | null;
  private resolveMap: () => void;

  constructor() {
    this.mapAvailable = new Promise(
      function (resolve: () => void) {
        this.resolveMap = resolve;
      }.bind(this)
    );
  }

  route(path: string) {
    const trackUrl = parseLocation(path);
    if (this.track) {
      this.hideTrack();
    }
    if (trackUrl) {
      this.loadTrack(trackUrl);
      return true;
    }
  }

  private loadTrack(url: string) {
    const track = (this.track = new L.GPX(url, { async: true }));
    const trackLoaded = new Promise(track.on.bind(track, 'loaded'));
    this.mapAvailable
      .then(function () {
        return trackLoaded;
      })
      .then(this.showTrack.bind(this));
  }

  setMap(map: L.Map) {
    this.map = map;
    this.resolveMap();
  }

  private showTrack(event: any) {
    if (this.track) {
      this.map.fitBounds(event.target.getBounds()).addLayer(this.track);
    }
  }

  private hideTrack() {
    if (this.track) {
      this.map.removeLayer(this.track);
    }
    this.track = null;
  }
}

function parseLocation(path: string) {
  const match = DROPBOX_URL.exec(path);
  return match && dropboxUrl(match[1], match[2]);
}

function dropboxUrl(hash: string, filename: string) {
  return 'https://dl.dropboxusercontent.com/s/' + hash + '/' + filename;
}
