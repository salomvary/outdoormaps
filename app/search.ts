import * as L from 'leaflet';
import Map from './map';
import { MapPlugin } from './map-plugin';
import SearchControl from './search-control';
import { mapbox as search, SearchResult } from './search-service';
import StateStore from './state-store';
import { AbortSignal } from './xhr';

export default class Search implements MapPlugin {
  private controller: Map;
  private options: StateStore;
  private map: L.Map;
  private control: SearchControl;
  private debouncedSearch: (val: string) => void;
  private request?: [Promise<SearchResult[]>, AbortSignal] & { query?: string };
  private results: SearchResult[];
  private marker?: L.Marker;

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;
    this.debouncedSearch = debounce(this.search.bind(this));
  }

  setMap(map: L.Map): void {
    this.map = map;
    this.control = new SearchControl({
      position: 'topright',
      onInput: this.onInput.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onSelect: this.onSelect.bind(this),
    });
    map.addControl(this.control);
  }

  private search(query: string): Promise<SearchResult[]> {
    // search if we haven't searched yet
    if (!this.request || this.request.query !== query) {
      this.onSearch();
      // if we have a pending request, abort it
      try {
        if (this.request) {
          this.request[1].abort();
        }
        this.request = search(query, {
          bounds: this.map.getBounds(),
        });
      } catch (e) {
        this.onError(e);
        return Promise.reject(e);
      }
      this.request.query = query;
      this.request[0].then(this.onSuccess.bind(this), this.onError.bind(this));
    }
    return this.request[0];
  }

  private reset() {
    if (this.request) {
      this.request[1].abort();
      delete this.request;
    }
    this.results = [];
    this.control.setResults(null);
    if (this.marker) {
      this.removeMarker();
    }
  }

  private showResult(result: SearchResult) {
    this.setMarker(result.center);
    if (result.boundingbox) {
      this.map.fitBounds(result.boundingbox);
    } else {
      this.map.panTo(result.center);
    }
  }

  private setMarker(position: L.LatLngExpression) {
    if (this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = this.controller.addMarker(position);
    }
  }

  private removeMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
    }
  }

  private onInput(val: string) {
    if (val.length) {
      this.debouncedSearch(val);
    } else {
      this.reset();
    }
  }

  private onSubmit(val: string) {
    if (val.length) {
      this.search(val).then(this.onSelect.bind(this, 0));
    } else {
      this.reset();
    }
  }

  private onSelect(i: number) {
    if (i < this.results.length) {
      const result = this.results[i];
      this.showResult(result);
      this.control.hideResults();
      // blur input, focus map so that it can be kb controlled
      this.map.getContainer().focus();
    }
  }

  private onSearch() {
    this.control.setResults('Searching...');
  }

  private onSuccess(results: SearchResult[]) {
    this.results = results;
    this.control.setResults(
      results.length ? results.map(formatResult) : 'No results'
    );
  }

  private onError(status: number | Error) {
    this.results = [];
    if (this.request![1].isAborted) {
      this.control.setResults('');
    } else {
      this.control.setResults('Search failed :(');
      window.console.error('Search failed', status);
    }
  }
}

function formatResult(result: SearchResult) {
  return result.display_name;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function debounce<F extends Function>(fn: F): F {
  let timer: null | NodeJS.Timeout = null;
  return <F>(<unknown>function () {
    // eslint-disable-next-line
    var context = this,
      // eslint-disable-next-line prefer-rest-params
      args = arguments;
    timer && clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, 100);
  });
}
