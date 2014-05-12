var klass = require('vendor/klass'),
    Location = require('location');

module.exports = klass({
  initialize: function(controller, options) {
    options.set(Location.get());
  }
});
