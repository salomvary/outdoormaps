import $ from './util';

export interface AbortSignal {
  abort(): void;
  isAborted: boolean;
}

interface GetOptions {
  data?: {
    [key: string]: string | number | boolean;
  };
}

export function get<T = any>(url: string, options?: GetOptions): Promise<T> {
  const [promise] = getWithXhr<T>(url, options);
  return promise;
}

export function getWithSignal<T>(
  url: string,
  options?: GetOptions
): [Promise<T>, AbortSignal] {
  const [promise, getXhr] = getWithXhr(url, options);
  // expose xhr.abort
  // TODO abort should clean up the promise
  const signal = {
    isAborted: false,
    abort() {
      getXhr().abort();
      this.isAborted = false;
    },
  };

  return [promise, signal];
}

export function getWithXhr<T = any>(
  url: string,
  options?: GetOptions
): [Promise<T>, () => XMLHttpRequest] {
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
  }) as Promise<T>;

  return [promise, () => xhr];
}

function encodeData(data: { [key: string]: string | number | boolean }) {
  return Object.keys(data)
    .map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    })
    .join('&');
}
