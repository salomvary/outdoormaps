/* jshint expr: true */
var Search = require('../search'),
    SearchControl = require('../search-control');

var FakeMap = function() {
  this.addControl = sinon.spy();
};

suite('Search', function() {
  var map,
      server,
      clock,
      subject;

  setup(function() {
    map = new FakeMap();
    server = sinon.fakeServer.create();
    clock = sinon.useFakeTimers();
    subject = new Search();
  });

  teardown(function() {
    clock.restore();
    server.restore();
  });

  test('initialize', function() {
    subject.setMap(map);
    expect(map.addControl).called;
  });

  test('search on input', function() {
    subject.setMap(map);

    sinon.stub(subject.control, 'setResults');
    server.respondWith('GET', /.*&q=hello$/, JSON.stringify([
      { display_name: 'foo' },
      { display_name: 'bar' }
    ]));

    subject.onInput('hello');
    clock.tick(1500);
    server.respond();
    expect(subject.control.setResults).calledWith(['foo', 'bar']);
  });
});

suite('Search Control', function() {
  var subject, container;

  setup(function() {
    subject = new SearchControl({
      onInput: sinon.spy(),
      onSelect: sinon.spy()
    });
    container = subject.onAdd();
  });

  test('show results', function() {
    subject.setResults(['foo', 'bar']);

    var items = container.querySelectorAll('.search-result');
    expect(items).length(2);
    expect(items[0].innerHTML).contain('foo');
    expect(items[1].innerHTML).contain('bar');
  });

  test('clear results', function() {
    subject.setResults(['foo', 'bar']);
    subject.setResults([]);

    var items = container.querySelectorAll('.search-result');
    expect(items).length(0);
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
});

function click(element) {
  var event = new MouseEvent('click');
  element.dispatchEvent(event);
}

function trigger(element, type) {
  /* global Event: true */
  var event = new Event(type);
  element.dispatchEvent(event);
}
