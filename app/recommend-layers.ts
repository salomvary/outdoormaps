import Layers, { LayerMapType } from './layers';
import Map from './map';
import StateStore from './state-store';
import { LatLngExpression } from 'leaflet';

export default class RecommendLayers {
  constructor(controller: Map, options: StateStore) {
    if (!options.get('layers') && options.get('center')) {
      const recommended = recommend('hiking', options.get('center'));
      if (recommended) {
        options.set('layers', [recommended]);
      }
    }
  }
}

export function recommend(mapType: LayerMapType, position: LatLngExpression) {
  const layers = Layers.keys(mapType);
  if (layers.length > 1) {
    // if we have more than one layer available for the given
    // map type, try to find the first that contains our position
    const containsPosition = layers.filter(function (layer) {
      return layer.bounds && layer.bounds.contains(position);
    });
    if (containsPosition.length > 0) {
      return containsPosition[0].id;
    }
    // if none of them contains our position, return the last
    // that is global (has no bounds)
    const globals = layers.filter(function (layer) {
      return !layer.bounds;
    });
    return globals[0].id;
  }
  return layers[0] ? layers[0].id : undefined;
}
