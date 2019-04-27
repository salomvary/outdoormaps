/* eslint-disable @typescript-eslint/camelcase */

import { expect, use } from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import Promise from './promise';
import Search from './search';
import SearchControl from './search-control';
import * as SearchService from './search-service';

use(sinonChai);

var FakeMap = function() {
  this.addControl = sinon.spy();
  this.fitBounds = sinon.spy();
  this.getBounds = function() {
    return {
      toBBoxString: function() { return 'a,b,c,d'; }
    };
  };
  this.getContainer = function() {
    return {
      focus: sinon.spy()
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

xdescribe('Search', function() {
  var map,
    sandbox,
    subject,
    controller,
    oneResult,
    clock;

  beforeEach(function() {
    map = new FakeMap();
    controller = new FakeController();
    subject = new Search(controller);
    subject.setMap(map);
    sandbox = sinon.createSandbox({useFakeServer: true});
    sandbox.stub(subject.control, 'setResults');
    sandbox.stub(subject.control, 'showResults');
    sandbox.stub(subject.control, 'hideResults');
    clock = sinon.useFakeTimers();
    oneResult = [{
      display_name: 'foo',
      lat: '1.5',
      lon: '2.5',
      boundingbox: ['1', '2', '3', '4']
    }];
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('initialize', function() {
    expect(map.addControl).called;
  });

  it('search on input', function() {
    sandbox.stub(SearchService, 'search')
      .returns(Promise.resolve(oneResult));
    subject.onInput('hello');
    clock.tick(120);
    expect(SearchService.search).called;
    expect(subject.control.setResults).calledWith(['foo']);
  });

  it('search on input - error', function() {
    sandbox.stub(SearchService, 'search')
      .returns(Promise.reject(500));
    subject.onInput('hello');
    clock.tick(120);
    expect(SearchService.search).called;
    expect(subject.control.setResults).calledWith('Search failed :(');
  });

  it('search on input - abort', function() {
    sandbox.stub(SearchService, 'search')
      .returns(Promise.reject(0));
    subject.onInput('hello');
    clock.tick(120);
    expect(SearchService.search).called;
    expect(subject.control.setResults).not.called;
  });

  it('search & show on submit', function() {
    sandbox.stub(SearchService, 'search')
      .returns(Promise.resolve(oneResult));
    subject.onSubmit('hello');
    expect(SearchService.search).called;
    expect(controller.addMarker).called;
    expect(map.fitBounds).called;
  });

  it('search & show on submit - no results', function() {
    sandbox.stub(SearchService, 'search', function() {
      return Promise.resolve([]);
    });
    subject.onSubmit('hello');
    expect(SearchService.search).called;
    expect(controller.addMarker).not.called;
    expect(map.fitBounds).not.called;
  });

  it('search & show on submit when already has results', function() {
    sandbox.stub(SearchService, 'search')
      .returns(Promise.resolve(oneResult));
    subject.onInput('hello');
    subject.onSubmit('hello');
    expect(SearchService.search).calledOnce;
    expect(controller.addMarker).called;
    expect(map.fitBounds).called;
  });

  it('search on input & submit', function() {
    // android browsers send both input and submit on submit
    sandbox.stub(SearchService, 'search')
      .returns(Promise.resolve(oneResult));
    // enter something, wait for the dropdown
    subject.onInput('hello');
    clock.tick(120);
    // hit submit later
    subject.onInput('hello');
    subject.onSubmit('hello');
    clock.tick(120);
    expect(subject.control.setResults).calledOnce;
    expect(subject.control.setResults).calledWith(['foo']);
  });

  it('select result', function() {
    subject.results = oneResult;

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

  it('select another result', function() {
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
      }
    ];

    subject.onSelect(0);
    subject.onSelect(1);
    expect(subject.marker.setLatLng).calledWith({
      lat: '3.5',
      lon: '4.5'
    });
  });
});

xdescribe('Search Service', function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  it('search success', function() {
    server.respondWith('GET', /.*&q=hello$/, JSON.stringify([
      { display_name: 'foo' },
      { display_name: 'bar' }
    ]));
    var success = sinon.spy();
    var bounds = {
      toBBoxString: function() { return 'a,b,c,d'; }
    };

    var request = SearchService.search('hello', {
      bounds: bounds
    });
    request.then(success);
    server.respond();
    expect(success).called;
    var results = success.args[0][0];
    expect(results[1].display_name).equal('bar');
  });

  it('search failed', function() {
    var success = sinon.spy();
    var fail = sinon.spy();
    var bounds = {
      toBBoxString: function() { return 'a,b,c,d'; }
    };
    var request = SearchService.search('hello', {
      bounds: bounds
    });
    request.then(success, fail);
    server.respond();
    expect(success).not.called;
    expect(fail).calledWith(404);
  });

  it('search aborted', function() {
    var success = sinon.spy();
    var fail = sinon.spy();
    var bounds = {
      toBBoxString: function() { return 'a,b,c,d'; }
    };
    var request = SearchService.search('hello', {
      bounds: bounds
    });
    request.then(success, fail);
    request.abort();
    expect(success).not.called;
    expect(fail).calledWith(0);
  });
});

xdescribe('Search Control', function() {
  var clock,
    subject,
    container;

  beforeEach(function() {
    subject = new (<any>SearchControl)({
      onInput: sinon.spy(),
      onSelect: sinon.spy()
    });
    container = subject._container = subject.onAdd();
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  it('show results', function() {
    sinon.spy(subject, 'showResults');
    subject.setResults(['foo', 'bar']);

    var items = container.querySelectorAll('.search-result');
    expect(items).length(2);
    expect(items[0].innerHTML).contain('foo');
    expect(items[1].innerHTML).contain('bar');
    expect(subject.showResults).called;
  });

  it('string results', function() {
    sinon.spy(subject, 'showResults');
    subject.setResults('hello');

    var items = container.querySelectorAll('.search-result');
    expect(items).length(1);
    expect(items[0].innerHTML).contain('hello');
    expect(subject.showResults).called;
  });

  it('clear results', function() {
    sinon.spy(subject, 'hideResults');
    subject.setResults(['foo', 'bar']);
    subject.setResults();

    var items = container.querySelectorAll('.search-result');
    expect(items).length(0);
    expect(subject.hideResults).called;
  });

  it('clear button', function() {
    subject.setResults(['foo', 'bar']);
    click(container.querySelector('.search-clear'));

    expect(subject.input.value).equals('');
    expect(subject.options.onInput).calledWith('');
  });

  it('select result', function() {
    subject.setResults(['foo', 'bar']);

    var item = container.querySelector('.search-result:first-child');
    click(item);
    expect(subject.options.onSelect).calledWith(0);
    expect(subject.input.value).equals('foo');
  });

  it('input', function() {
    var input = container.querySelector('input');
    input.value = 'foo';
    trigger(input, 'input');
    expect(subject.options.onInput).calledWith('foo');
  });

  it('blur', function() {
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
