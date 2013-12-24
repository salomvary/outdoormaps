var $ = require('util'),
    L = require('vendor/leaflet'),
    padding = 7,
    attributionHeight = 16,
    inputHeight = 40;

module.exports = L.Control.extend({
  onAdd: function() {
    // setup elements
    var control = $.create('form', 'search-control');
    var input = this.input = $.create('input', 'search-input', control);
    input.type = 'search';
    input.placeholder = 'Search';
    var results = this.results = $.create('ul', 'search-results', control);
    this.adjustHeight();
    // setup events
    L.DomEvent.disableClickPropagation(control);
    $.on(control, 'submit', this.onSubmit, this);
    $.on(input, 'input', this.onInput, this);
    $.on(input, 'focus', this.onFocus, this);
    $.on(input, 'blur', this.onBlur, this);
    $.on(results, 'touchstart', this.onResultsTouch, this);
    return control;
  },

  onFocus: function() {
    if (this.results.childNodes.length) {
      this.showResults();
    }
  },

  onBlur: function() {
    // hide results on desktop browsers
    // TODO: instead of blur it should be something like:
    // anything else than interacting with the search happens
    if (!L.Browser.touch) {
      // make sure we can click on the list
      setTimeout(this.hideResults.bind(this), 10);
    }
  },

  onResultsTouch: function() {
    // blur so that the sw keyboard is not whown anymore
    this.input.blur();
  },

  onInput: function() {
    this.options.onInput(this.getVal());
  },

  onSubmit: function(event) {
    event.preventDefault();
    this.options.onSubmit(this.getVal());
  },

  getVal: function() {
    return this.input.value.trim();
  },

  adjustHeight: function() {
    var height = window.innerHeight - 3 * padding - inputHeight - attributionHeight;
    this.results.style.maxHeight = height + 'px';
  },

  setResults: function(results) {
    this.results.innerHTML = '';
    if (results) {
      if (typeof results == 'string') {
        results = [results];
      }
      results.map(function(result, i) {
        var res = $.create('li', 'search-result');
        res.innerHTML = result;
        $.on(res, 'click', this.options.onSelect.bind(null, i));
        this.results.appendChild(res);
      }, this);
    }
    if (results && results.length) {
      this.showResults();
    } else {
      this.hideResults();
    }
  },

  showResults: function() {
    $.toggleClass(this.getContainer(), 'show-results', true);
  },

  hideResults: function() {
    $.toggleClass(this.getContainer(), 'show-results', false);
  }
});
