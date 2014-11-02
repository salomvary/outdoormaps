var Layers = require('layers');

module.exports = function(controller, options) {
  if (!options.get('layers') && options.get('center')) {
    var recommended = exports.recommend('hiking', options.get('center'));
    if (recommended) {
      options.set('layers', [recommended]);
    }
  }
};

exports.recommend = function(mapType, position) {
  var layers = Layers.keys(mapType);
  if (layers.length > 1) {
    // if we have more than one layer available for the given
    // map type, try to find the first that contains our position
    var containsPosition = layers.filter(function(layer) {
      return layer.bounds && layer.bounds.contains(position);
    });
    if (containsPosition.length > 0) {
      return containsPosition[0].id;
    }
    // if none of them contains our position, return the last
    // that is global (has no bounds)
    var globals = layers.filter(function(layer) {
      return !layer.bounds;
    });
    return globals[0].id;
  }
  return layers[0] ? layers[0].id : undefined;
};
