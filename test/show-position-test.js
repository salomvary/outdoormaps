var ShowPosition = require('../show-position');

suite('ShowPosition', function() {
  setup(function() {
  });

  teardown(function() {
  });

  test('initialize', function() {
    var subject = new ShowPosition({}, {});
    assert.ok(subject);
  });
});
