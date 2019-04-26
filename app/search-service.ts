import {get} from './xhr';

const baseUrl = '//nominatim.openstreetmap.org/search';

export function search(query, options) {
  var params = {
    addressdetails: 1,
    format: 'json',
    limit: 15,
    viewboxlbrt: options.bounds.toBBoxString(),
    q: query
  };
  var url = baseUrl + '?' + encodeParams(params);
  return get(url);
}

function encodeParams(params) {
  return Object.keys(params)
    .reduce(function(entries, key) {
      entries.push(key + '=' + encodeURIComponent(params[key]));
      return entries;
    }, [])
    .join('&');
}
