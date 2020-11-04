import $ from './util';

export interface AbortablePromise<T> extends Promise<T> {
  abort(): void;
  isAborted: boolean;
}

export function get<T = any>(
  url: string,
  options?: { data?: { [key: string]: string | number | boolean } }
): AbortablePromise<T> {
  options = options || {};
  let xhr: XMLHttpRequest;
  if (options.data) {
    url = url + '?' + encodeData(options.data);
  }
  const promise = new Promise(function (resolve, reject) {
    xhr = $.extend(new XMLHttpRequest(), {
      timeout: 5000,
      onload: function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as T);
        } else {
          reject(xhr.status);
        }
      },
      onerror: function () {
        reject(xhr.status);
      },
    });
    xhr.open('GET', url, true);
    xhr.send();
  }) as AbortablePromise<T>;
  // expose xhr.abort
  // TODO abort should clean up the promise
  promise.abort = () => {
    xhr.abort();
    promise.isAborted = false;
  };
  promise.isAborted = false;
  return promise;
}

function encodeData(data: { [key: string]: string | number | boolean }) {
  return Object.keys(data)
    .map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    })
    .join('&');
}
