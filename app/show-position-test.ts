import { assert } from 'chai';
import ShowPosition from './show-position';

describe('ShowPosition', function() {
  it('initialize', function() {
    var subject = new ShowPosition({}, {});
    assert.ok(subject);
  });
});
