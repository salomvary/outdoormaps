define(function(require) {
  require('./search-test');
  require('./show-position-test');
  require('./promise-test');
  require('./location-test');
  mocha.run();
});
