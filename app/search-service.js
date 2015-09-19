var xhr = require('xhr'),
    baseUrl = 'http://nominatim.openstreetmap.org/search';

module.exports.search = function(query, options) {
  var params = {
    addressdetails: 1,
    format: 'json',
    limit: 15,
    viewboxlbrt: options.bounds.toBBoxString(),
    q: query
  };
  var url = baseUrl + '?' + encodeParams(params);
  return xhr.get(url);
};

function encodeParams(params) {
  return Object.keys(params)
    .reduce(function(entries, key) {
      entries.push(key + '=' + encodeURIComponent(params[key]));
      return entries;
    }, [])
    .join('&');
}
