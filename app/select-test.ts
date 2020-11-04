import { expect } from 'chai';
import Select from './select';

describe('Select', function () {
  it('renders <button> elements', function () {
    const el = document.createElement('div');
    const subject = new Select(el, {
      values: { first: 'Foo', second: 'Bar' },
    });

    expect(subject.el.querySelectorAll('button')).to.have.lengthOf(2);
    expect(subject.el.querySelector('button')).to.have.property(
      'className',
      'flat-btn'
    );
  });
});
