import { expect } from 'chai';
import DropMarker from './drop-marker';
import Map from './map';
import StateStore from './state-store';

describe('DropMarker', function() {
  it('sets up defaults', function() {
    const controller: Map = <any>{};
    const options: StateStore = <any>{};

    const dropMarker = new DropMarker(controller, options);

    expect(dropMarker.controller).to.eql(controller);
    expect(dropMarker.options).to.eql(options);
  });
});
