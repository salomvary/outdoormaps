var klass = require('vendor/klass'),
    Location = require('location');

module.exports = klass({
  initialize: function(controller) {
    controller.plugins.some(function(plugin) {
      return plugin.route && plugin.route(Location.get());
    });
  }
});
