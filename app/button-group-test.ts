import { expect } from 'chai';
import ButtonGroup from './button-group';

describe('ButtonGroup', function() {
  it('renders <button> elements', function() {
    const subject = new ButtonGroup({
      values: {first: 'Foo', second: 'Bar'}
    });

    expect(subject.el.querySelectorAll('button')).to.have.lengthOf(2);
    expect(subject.el.querySelector('button')).to.have.property('className', 'radio-btn');
  });
});
