import * as L from 'leaflet';
import Map from './map';
import { MapPlugin } from './map-plugin';
import SearchControl from './search-control';
import { search, SearchResult } from './search-service';
import StateStore from './state-store';
import { AbortablePromise } from './xhr';

export default class Search implements MapPlugin {
  private controller: Map
  private options: StateStore
  private map: L.Map
  private control: SearchControl;
  private debouncedSearch: (val: string) => void;
  private request: AbortablePromise<SearchResult[]> & {query?: string}
  private results: SearchResult[];
  private marker?: L.Marker;

  constructor(controller: Map, options: StateStore) {
    this.controller = controller;
    this.options = options;
    this.debouncedSearch = debounce(this.search.bind(this));
  }

  setMap(map: L.Map) {
    this.map = map;
    this.control = new SearchControl({
      position: 'topright',
      onInput: this.onInput.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onSelect: this.onSelect.bind(this)
    });
    map.addControl(this.control);
  }

  private search(query: string) {
    // search if we haven't searched yet
    if (!this.request || this.request.query !== query) {
      // if we have a pending request, abort it
      if (this.request) {
        this.request.abort();
      }
      this.request = search(query, {
        bounds: this.map.getBounds()
      });
      this.request.query = query;
      this.request.then(this.onSuccess.bind(this), this.onError.bind(this));
    }
    return this.request;
  }

  private reset() {
    if (this.request) {
      this.request.abort();
    }
    this.results = [];
    this.control.setResults(null);
    if (this.marker) {
      this.removeMarker();
    }
  }

  private showResult(result: SearchResult) {
    this.setMarker({
      lat: result.lat,
      lng: result.lon
    });
    this.map.fitBounds([
      [result.boundingbox[0], result.boundingbox[2]],
      [result.boundingbox[1], result.boundingbox[3]]
    ]);
  }

  private setMarker(position: L.LatLngExpression) {
    if (this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = this.controller.addMarker(position);
    }
  }

  private removeMarker() {
    this.map.removeLayer(this.marker);
    this.marker = null;
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
      this.search(val)
        .then(this.onSelect.bind(this, 0));
    } else {
      this.reset();
    }
  }

  private onSelect(i: number) {
    if (i < this.results.length) {
      var result = this.results[i];
      this.showResult(result);
      this.control.hideResults();
      // blur input, focus map so that it can be kb controlled
      this.map.getContainer().focus();
    }
  }

  private onSuccess(results: SearchResult[]) {
    this.results = results;
    this.control.setResults(
      results.length ? results.map(formatResult) : 'No results');
  }

  private onError(status: number) {
    // zero is abort (user or programmatic)
    if (status !== 0) {
      this.results = [];
      this.control.setResults('Search failed :(');
    }
  }
}

function formatResult(result: SearchResult) {
  return result.display_name;
}

function debounce<F extends Function>(fn: F): F {
  var timer = null;
  return <F><unknown> function() {
    // eslint-disable-next-line
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, 100);
  };
}
