import $ from './util';

export interface AbortablePromise<T> extends Promise<T> {
  abort(): void;
}

export function get(url, options?): AbortablePromise<any> {
  options = options || {};
  var xhr;
  if (options.data) {
    url = url + '?' + encodeData(options.data);
  }
  var promise: any = new Promise(function(resolve, reject) {
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

function encodeData(data) {
  return Object.keys(data)
    .map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    })
    .join('&');
}
