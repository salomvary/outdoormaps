import * as L from 'leaflet';

declare module 'leaflet' {
  export class GPX extends L.FeatureGroup {
    public constructor(url: string, options: {async: boolean})
  }
}
