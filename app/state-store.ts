import $ from './util';
import * as L from 'leaflet';

export interface State {
  bounds?: L.LatLngBoundsLiteral;
  layers?: [string, string?];
  defaultLayers?: { [mapType: string]: string };
  routingService?: string;
  zoom?: number;
  center?: L.LatLngLiteral;
  marker?: L.LatLngLiteral;
  position?: L.LatLngLiteral;
  routingVehicle?: string;
  routingWaypoints?: L.LatLngLiteral[];
  routingActive?: boolean;
}

export default class StateStore {
  private properties: State;

  constructor() {
    this.properties = {};
    this.load();
  }

  set(key: 'bounds', value: L.LatLngBoundsLiteral): void;
  set(key: 'layers', value: [string, string?]): void;
  set(key: 'defaultLayers', value: { [key: string]: string }): void;
  set(key: 'center', value: L.LatLngLiteral): void;
  set(key: 'position', value: L.LatLngExpression): void;
  set(key: 'routingVehicle', value: string): void;
  set(key: 'routingService', value: string): void;
  set(key: 'routingActive', value: boolean): void;
  set(key: 'routingWaypoints', value: L.LatLngLiteral[]): void;
  set(key: 'zoom', value: number): void;
  set(key: State): void;

  set(key: any, value?: any): void {
    if (typeof key === 'object') {
      $.extend(this.properties, key);
    } else {
      (this.properties as any)[key] = value;
    }
    this.save();
  }

  get(key: 'bounds'): L.LatLngBoundsLiteral;
  get(key: 'layers'): [string, string?];
  get(key: 'defaultLayers'): { [key: string]: string };
  get(key: 'marker'): L.LatLngLiteral;
  get(key: 'center'): L.LatLngLiteral;
  get(key: 'position'): L.LatLngLiteral;
  get(key: 'routingVehicle'): string;
  get(key: 'routingService'): string;
  get(key: 'routingActive'): boolean;
  get(key: 'routingWaypoints'): L.LatLngLiteral[];
  get(key: 'zoom'): number;
  get(): State;

  get(key?: keyof State) {
    return key ? this.properties[key] : this.properties;
  }

  load() {
    let properties: State;
    if (window.localStorage && localStorage.turistautak) {
      try {
        properties = JSON.parse(localStorage.turistautak, reviver);
      } catch (e) {
        /* parse error, ignore it */
        window.console.error('Error parsing localStorage', e);
        properties = {};
      }
      $.extend(this.properties, properties);
    }
  }

  save() {
    if (window.localStorage) {
      localStorage.turistautak = JSON.stringify(this.properties);
    }
  }
}

function reviver(k: string, v: any) {
  if (v.lat && v.lng) {
    return new L.LatLng(v.lat, v.lng);
  } else {
    return v;
  }
}
