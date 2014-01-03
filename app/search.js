var klass = require('vendor/klass'),
    SearchControl = require('search-control'),
    SearchService = require('search-service');

module.exports = klass({
  initialize: function(controller, options) {
    this.controller = controller;
    this.options = options;
    this.debouncedSearch = debounce(this.search.bind(this));
  },

  setMap: function(map) {
    this.map = map;
    this.control = new SearchControl({
      position: 'topright',
      onInput: this.onInput.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onSelect: this.onSelect.bind(this)
    });
    map.addControl(this.control);
  },

  search: function(query) {
    // search if we haven't searched yet
    if (!this.request || this.request.query != query) {
      // if we have a pending request, abort it
      if (this.request) {
        this.request.abort();
      }
      this.request = SearchService.search(query, {
        bounds: this.map.getBounds()
      });
      this.request.query = query;
    }
    this.request.then(this.onSuccess.bind(this), this.onError.bind(this));
    return this.request;
  },

  reset: function() {
    if (this.request) {
      this.request.abort();
    }
    this.results = [];
    this.control.setResults(null);
    if (this.marker) {
      this.removeMarker();
    }
  },

  showResult: function(result) {
    this.setMarker({
      lat: result.lat,
      lon: result.lon
    });
    this.map.fitBounds([
     [result.boundingbox[0], result.boundingbox[2]],
     [result.boundingbox[1], result.boundingbox[3]]
    ]);
  },

  setMarker: function(position) {
    if(this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = this.controller.addMarker(position);
    }
  },

  removeMarker: function() {
    this.map.removeLayer(this.marker);
    this.marker = null;
  },

  onInput: function(val) {
    if (val.length) {
      this.debouncedSearch(val);
    } else {
      this.reset();
    }
  },

  onSubmit: function(val) {
    if (val.length) {
        this.search(val)
          .then(this.onSelect.bind(this, 0));
    } else {
      this.reset();
    }
  },

  onSelect: function(i) {
    if (i < this.results.length) {
      var result = this.results[i];
      this.showResult(result);
      this.control.hideResults();
      // blur input, focus map so that it can be kb controlled
      this.map.getContainer().focus();
    }
  },

  onSuccess: function(results) {
    this.results = results;
    this.control.setResults(
      results.length ? results.map(formatResult) : 'No results');
  },

  onError: function(status) {
    // zero is abort (user or programmatic)
    if (status !== 0) {
      this.results = [];
      this.control.setResults('Search failed :(');
    }
  }
});

function formatResult(result) {
  return result.display_name;
}

function debounce(fn) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, 100);
  };
}
