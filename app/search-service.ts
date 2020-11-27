import * as L from 'leaflet';
import { mapboxKey } from './config';
import { AbortSignal, getWithSignal } from './xhr';

const baseUrl = '//nominatim.openstreetmap.org/search';

export interface SearchResult {
  boundingbox?: L.LatLngBounds;
  center: L.LatLng;
  display_name: string;
}

export type NominatimResponse = Array<{
  boundingbox: [number, number, number, number];
  lon: number;
  lat: number;
  // eslint-disable-next-line camelcase
  display_name: string;
}>;

export function nominatim(
  query: string,
  options: { bounds: L.LatLngBounds }
): [Promise<SearchResult[]>, AbortSignal] {
  const params = {
    addressdetails: '1',
    format: 'json',
    limit: '15',
    viewboxlbrt: options.bounds.toBBoxString(),
    q: query,
  };
  const url = baseUrl + '?' + encodeParams(params);
  const [promise, signal] = getWithSignal<NominatimResponse>(url);
  return [
    promise.then((response) =>
      response.map((result) => ({
        boundingbox: L.latLngBounds([
          [result.boundingbox[0], result.boundingbox[2]],
          [result.boundingbox[1], result.boundingbox[3]],
        ]),
        center: L.latLng([result.lat, result.lon]),
        display_name: result.display_name,
      }))
    ),
    signal,
  ];
}

interface MapboxResponse {
  features: Array<{
    text: string;
    place_name: string;
    // minX, minY, maxX, maxY
    bbox: [number, number, number, number];
    // longitude, latitude
    center: [number, number];
  }>;
}

export function mapbox(
  query: string,
  options: { bounds: L.LatLngBounds }
): [Promise<SearchResult[]>, AbortSignal] {
  const center = options.bounds.getCenter();
  const params = {
    access_token: mapboxKey,
    autocomplete: 'true',
    limit: '10',
    proximity: `${center.lng},${center.lat}`,
  };
  const searchText = encodeURIComponent(query);
  const searchParams = new URLSearchParams(params).toString();
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?${searchParams}`;

  const [promise, signal] = getWithSignal<MapboxResponse>(url);
  return [
    promise.then((response) =>
      response.features.map((feature) => ({
        boundingbox: feature.bbox
          ? L.latLngBounds([
              [feature.bbox[1], feature.bbox[0]],
              [feature.bbox[3], feature.bbox[2]],
            ])
          : undefined,
        center: L.latLng([feature.center[1], feature.center[0]]),
        display_name: feature.place_name,
      }))
    ),
    signal,
  ];
}

function encodeParams(params: { [key: string]: string }) {
  return Object.keys(params)
    .reduce(function (entries, key) {
      entries.push(key + '=' + encodeURIComponent(params[key]));
      return entries;
    }, [] as string[])
    .join('&');
}
