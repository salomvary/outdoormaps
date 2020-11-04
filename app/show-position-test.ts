import { assert } from 'chai';
import ShowPosition from './show-position';
import StateStore from './state-store';
import Map from './map';

describe('ShowPosition', function () {
  it('sets up defaults', function () {
    const controller: Map = <any>{};
    const options: StateStore = <any>{};

    var subject = new ShowPosition(controller, options);
    assert.ok(subject);
  });
});
