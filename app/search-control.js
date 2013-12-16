var $ = require('util'),
    L = require('vendor/leaflet');

module.exports = L.Control.extend({
  onAdd: function() {
    var control = $.create('div', 'search-control');
    var input = $.create('input', 'search-input', control);
    input.type = 'search';
    input.placeholder = 'Search';
    this.results = $.create('ul', 'search-results', control);
    L.DomEvent.disableClickPropagation(control);
    $.on(input, 'input', this.onInput, this);
    $.on(input, 'focus', this.onFocus, this);
    $.on(input, 'blur', this.onBlur, this);
    return control;
  },

  onFocus: function() {
    if (this.results.childNodes.length) {
      this.showResults();
    }
  },

  onBlur: function() {
    // make sure we can click on the list
    setTimeout(this.hideResults.bind(this), 10);
  },

  onInput: function(event) {
    var val = event.target.value.trim();
    this.options.onInput(val);
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
