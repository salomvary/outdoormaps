var baseUrl = 'http://open.mapquestapi.com/nominatim/v1/search.php',
    request;

module.exports.search = function(query, bounds, success, error, context) {
  var params = {
    addressdetails: 1,
    format: 'json',
    limit: 15,
    viewboxlbrt: bounds.toBBoxString(),
    q: query
  };
  var url = baseUrl + '?' + encodeParams(params);
  get(url, success, error, context);
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
  if (request) {
    request.abort();
  }
  request = new XMLHttpRequest();
  request.timeout = 5000;
  request.onload = function() {
    if (request.status >= 200 && request.status < 300) {
      success.call(context, JSON.parse(request.responseText));
    } else {
      error.call(context, request.status);
    }
    request = null;
  };
  request.onerror = function() {
    error.call(context, this.status);
    request = null;
  };
  request.open('GET', url, true);
  request.send();
}
