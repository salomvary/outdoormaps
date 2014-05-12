var Location = require('location');

suite('Location', function() {
  test('parse', function() {
    expect(Location.parse('osm,19.5,52.1,13'))
      .deep.equal({layers: ['osm'], center: {lat: 19.5, lng: 52.1}, zoom: 13});
    expect(Location.parse('crap'))
      .deep.equal({}, 'empty state');
  });

  test('serialize', function() {
    expect(Location.serialize({layers: ['osm'], center: {lat: 19.5, lng: 52.1}, zoom: 13}))
      .equal('osm,19.5,52.1,13');
  });
});
