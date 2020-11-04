import * as L from 'leaflet';
import StateStore from './state-store';
import Map from './map';

export interface MapPluginConstructor {
  new (controller: Map, options: StateStore): MapPlugin;
}

export interface MapPlugin {
  beforeMap?: () => Promise<void> | void;
  setMap?: (map: L.Map) => void;
  route?: (location: string) => void;
}
