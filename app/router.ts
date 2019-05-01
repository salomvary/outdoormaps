import Location from './location';
import Map from './map';
import { MapPlugin } from './map-plugin';

export default function router(controller: Map) {
  const handlers = controller.plugins.filter(function(plugin) {
    return plugin.route;
  });
  route(handlers);
  Location.on('change', () => route(handlers), this);
}

function route(handlers: MapPlugin[]) {
  var location = Location.get();
  handlers.forEach(function(plugin) {
    return plugin.route(location);
  });
}
