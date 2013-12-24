var $ = require('util'),
    baseUrl = 'http://open.mapquestapi.com/nominatim/v1/search.php';

module.exports.search = function(query, options) {
  var params = {
    addressdetails: 1,
    format: 'json',
    limit: 15,
    viewboxlbrt: options.bounds.toBBoxString(),
    q: query
  };
  var url = baseUrl + '?' + encodeParams(params);
  get(url, options.success, options.error, options.context);
};

function encodeParams(params) {
  return Object.keys(params)
    .reduce(function(entries, key) {
      entries.push(key + '=' + encodeURIComponent(params[key]));
      return entries;
    },[])
    .join('&');
}

function get(url, success, error, context) {
  var request = $.extend(new XMLHttpRequest(), {
    timeout: 5000,
    onload: function() {
      if (request.status >= 200 && request.status < 300) {
        success.call(context, JSON.parse(request.responseText));
      } else {
        error.call(context, request.status);
      }
      request = null;
    },
    onerror: function() {
      error.call(context, this.status);
      request = null;
    }
  });
  request.open('GET', url, true);
  request.send();
  return request;
}
