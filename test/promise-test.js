var Promise = require('../promise');

suite('Promise', function() {

  test('async', function(done) {
    //expect(1);
    foo({yo:1}).then(baz).then(function(data) {
      assert.ok(true);
      done();
    }, function(err) {
      assert.ok(false);
      done();
    });//.then(baz);
  });

  test('async fail', function(done) {
    //expect(1);
    foo({yo:1}).then(bar).then(baz).then(function(data) {
    //bar({test:1}).then(foo).then(function(data) {
      assert.ok(false);
      done();
    }, function(err) {
      assert.ok(true);
      done();
    });
  });

  test('sync', function(done) {
    //expect(1);
    var fooResult = fooSync({yo:1});
    var bazResult = fooResult.then(bazSync);
    bazResult.then(function(data) {
      assert.ok(true);
      done();
    }, function(err) {
      assert.ok(false);
      done();
    });//.then(baz);
  });

  test('sync fail', function(done) {
    //expect(1);
    fooSync({yo:1}).then(barSync).then(bazSync).then(function(data) {
      assert.ok(false);
      done();
    }, function(err) {
      assert.ok(true);
      done();
    });//.then(baz);
  });

  // fixtures

  function foo(data) {
    console.log('foo');
    var p = Promise();
    setTimeout(function() {
      data.foo = true;
      console.log('fooDone');
      p.resolve(data);
    }, 1);
    return p;
  }

  function bar(data) {
    console.log('bar');
    var p = Promise();
    setTimeout(function() {
      console.log('barFail');
      p.reject("barError");
    }, 1);
    return p;
  }

  function baz(data) {
    console.log('baz');
    var p = Promise();
    setTimeout(function() {
      data.baz = true;
      console.log('bazDone');
      p.resolve(data);
    }, 1);
    return p;
  }

  function fooSync(data) {
    console.log('foo');
    var p = Promise();
    data.foo = true;
    console.log('fooDone');
    p.resolve(data);
    return p;
  }

  function barSync(data) {
    console.log('bar');
    var p = Promise();
    p.reject("barError");
    return p;
  }

  function bazSync(data) {
    console.log('baz');
    var p = Promise();
    data.baz = true;
    console.log('bazDone');
    p.resolve(data);
    return p;
  }
});
