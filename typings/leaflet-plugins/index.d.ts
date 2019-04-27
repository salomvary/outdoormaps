import * as L from 'leaflet';

declare module 'leaflet-plugins/layer/vector/GPX' {
  export default class Gpx extends L.FeatureGroup {
    public constructor(url: string, options: {async: boolean})
  }
}
