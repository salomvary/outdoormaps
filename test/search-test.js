/* jshint expr: true */
var Search = require('search'),
    SearchControl = require('search-control'),
    SearchService = require('search-service');

var FakeMap = function() {
  this.addControl = sinon.spy();
  this.fitBounds = sinon.spy();
  this.getBounds = function() {
    return {
      toBBoxString: function() { return 'a,b,c,d'; }
    };
  };
};

var FakeMarker = function() {
  this.setLatLng = sinon.spy();
};

var FakeController = function() {
  this.addMarker = sinon.spy(function() {
    return new FakeMarker();
  });
};

suite('Search', function() {
  var map,
      sandbox,
      subject,
      controller;

  setup(function() {
    map = new FakeMap();
    controller = new FakeController();
    subject = new Search(controller);
    subject.setMap(map);
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
    sandbox.stub(subject.control, 'setResults');
    sandbox.stub(subject.control, 'showResults');
    sandbox.stub(subject.control, 'hideResults');
  });

  teardown(function() {
    sandbox.restore();
  });

  test('initialize', function() {
    expect(map.addControl).called;
  });

  test('search on input', function() {
    sandbox.stub(SearchService, 'search', function(val, bounds, success, error, ctx) {
      success.call(ctx, [
        { display_name: 'foo' }
      ]);
    });
    subject.onInput('hello');
    sandbox.clock.tick(120);
    expect(SearchService.search).called;
    expect(subject.control.setResults).calledWith(['foo']);
  });

  test('select result', function() {
    subject.results = [{
      display_name: 'foo',
      lat: '1.5',
      lon: '2.5',
      boundingbox: ['1', '2', '3', '4']
    }];

    subject.onSelect(0);
    expect(controller.addMarker).calledWith({
      lat: '1.5',
      lon: '2.5'
    });
    expect(map.fitBounds).calledWith([
      ['1', '3'],
      ['2', '4']
    ]);
    expect(subject.control.hideResults).called;
  });

  test('select result', function() {
    subject.results = [{
      display_name: 'foo',
      lat: '1.5',
      lon: '2.5',
      boundingbox: ['1', '2', '3', '4']
    }];

    subject.onSelect(0);
    expect(controller.addMarker).calledWith({
      lat: '1.5',
      lon: '2.5'
    });
    expect(map.fitBounds).calledWith([
      ['1', '3'],
      ['2', '4']
    ]);
    expect(subject.control.hideResults).called;
  });

  test('select another result', function() {
    subject.results = [
      {
        display_name: 'foo',
        lat: '1.5',
        lon: '2.5',
        boundingbox: ['1', '2', '3', '4']
      },
      {
        display_name: 'bar',
        lat: '3.5',
        lon: '4.5',
        boundingbox: ['1', '2', '3', '4']
      },
    ];

    subject.onSelect(0);
    subject.onSelect(1);
    expect(subject.marker.setLatLng).calledWith({
      lat: '3.5',
      lon: '4.5'
    });
  });
});

suite('Search Service', function() {
  var server;

  setup(function() {
    server = sinon.fakeServer.create();
  });

  teardown(function() {
    server.restore();
  });

  test('search success', function() {
    server.respondWith('GET', /.*&q=hello$/, JSON.stringify([
      { display_name: 'foo' },
      { display_name: 'bar' }
    ]));
    var success = sinon.spy();
    var bounds = {
      toBBoxString: function() { return 'a,b,c,d'; }
    };

    SearchService.search('hello', bounds, success);
    server.respond();
    expect(success).called;
    var results = success.args[0][0];
    expect(results[1].display_name).equal('bar');
  });
});

suite('Search Control', function() {
  var clock,
      subject,
      container;

  setup(function() {
    subject = new SearchControl({
      onInput: sinon.spy(),
      onSelect: sinon.spy()
    });
    container = subject._container = subject.onAdd();
    clock = sinon.useFakeTimers();
  });

  teardown(function() {
    clock.restore();
  });

  test('show results', function() {
    sinon.spy(subject, 'showResults');
    subject.setResults(['foo', 'bar']);

    var items = container.querySelectorAll('.search-result');
    expect(items).length(2);
    expect(items[0].innerHTML).contain('foo');
    expect(items[1].innerHTML).contain('bar');
    expect(subject.showResults).called;
  });

  test('string results', function() {
    sinon.spy(subject, 'showResults');
    subject.setResults('hello');

    var items = container.querySelectorAll('.search-result');
    expect(items).length(1);
    expect(items[0].innerHTML).contain('hello');
    expect(subject.showResults).called;
  });

  test('clear results', function() {
    sinon.spy(subject, 'hideResults');
    subject.setResults(['foo', 'bar']);
    subject.setResults();

    var items = container.querySelectorAll('.search-result');
    expect(items).length(0);
    expect(subject.hideResults).called;
  });

  test('select result', function() {
    subject.setResults(['foo', 'bar']);

    var item = container.querySelector('.search-result:first-child');
    click(item);
    expect(subject.options.onSelect).calledWith(0);
  });

  test('input', function() {
    var input = container.querySelector('input');
    input.value = 'foo';
    trigger(input, 'input');
    expect(subject.options.onInput).calledWith('foo');
  });

  test('blur', function() {
    sinon.spy(subject, 'hideResults');
    var input = container.querySelector('input');
    trigger(input, 'blur');
    clock.tick(50);
    expect(subject.hideResults).called;
  });
});

function click(element) {
  var event = new MouseEvent('click');
  element.dispatchEvent(event);
}

function trigger(element, type) {
  /* global Event: true, FocusEvent: true */
  var types = {
    focus: FocusEvent,
    blur: FocusEvent
  };
  var Type = types[type] || Event;
  var event = new Type(type);
  element.dispatchEvent(event);
}
