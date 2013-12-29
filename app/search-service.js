var $ = require('util'),
    Promise = require('promise'),
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
  return get(url);
};

function encodeParams(params) {
  return Object.keys(params)
    .reduce(function(entries, key) {
      entries.push(key + '=' + encodeURIComponent(params[key]));
      return entries;
    },[])
    .join('&');
}

function get(url) {
  var xhr;
  var promise = Promise(function(resolve, reject) {
    xhr = $.extend(new XMLHttpRequest(), {
      timeout: 5000,
      onload: function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(xhr.status);
        }
      },
      onerror: function() {
        reject(xhr.status);
      }
    });
    xhr.open('GET', url, true);
    xhr.send();
  });
  // expose xhr.abort
  // TODO abort should clean up the promise
  promise.abort = xhr.abort.bind(xhr);
  return promise;
}
