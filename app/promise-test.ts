import { expect } from 'chai';
import * as sinon from 'sinon';
import Promise from './promise';

describe('Promise', function() {
  it('constructor', function(done) {
    new Promise(function(resolve) {
      resolve('hello');
    })
      .then(function(data) {
        expect(data).equal('hello');
        done();
      }, failTest);
  });

  it('async success', function(done) {
    asyncResolve('hello').then(function(data) {
      expect(data).equal('hello');
      done();
    }, failTest);
  });

  it('async fail', function(done) {
    asyncReject('hello').then(failTest, function(err) {
      expect(err).equal('hello');
      done();
    });
  });

  it('async chain', function(done) {
    var first = asyncResolve.bind(null, 'first');
    var second = asyncResolve.bind(null, 'second');
    first().then(second).then(function(data) {
      expect(data).equal('second');
      done();
    }, failTest);
  });

  it('async chain fail then success', function(done) {
    var first = asyncReject.bind(null, 'first');
    var second = asyncResolve.bind(null, 'second');
    first().then(failTest, second).then(function(data) {
      expect(data).equal('second');
      done();
    }, failTest);
  });

  it('async chain success then fail', function(done) {
    var first = asyncResolve.bind(null, 'first');
    var second = asyncReject.bind(null, 'second');
    first().then(second, failTest).then(failTest, function(data) {
      expect(data).equal('second');
      done();
    });
  });

  it('sync', function(done) {
    Promise.resolve('hello').then(function(data) {
      expect(data).equal('hello');
      done();
    }, failTest);
  });

  it('sync fail', function(done) {
    Promise.reject('hello').then(failTest, function(err) {
      expect(err).equal('hello');
      done();
    });
  });

  it('async multiple then', function(done) {
    var fn = sinon.spy();
    var promise = asyncResolve('hello');
    promise.then(fn, failTest);
    promise.then(fn, failTest);
    promise.then(function() {
      expect(fn).calledTwice;
      done();
    }, failTest);
  });

  it('Promise.chain', function(done) {
    var first = sinon.spy(function() {
      return Promise.resolve('first');
    });
    var second = sinon.spy(function() {
      return Promise.resolve('second');
    });
    Promise.chain([first, second])
      .then(function(result) {
        expect(first).calledOnce;
        expect(second).calledOnce;
        expect(second).calledWith('first');
        expect(result).equal('second');
        done();
      }, failTest);
  });

  // fixtures

  function failTest() {
    throw new Error('this should not happen');
  }

  function asyncResolve(data) {
    return new Promise(function(resolve) {
      setTimeout(resolve.bind(null, data), 1);
    });
  }

  function asyncReject(data) {
    return new Promise(function(resolve, reject) {
      setTimeout(reject.bind(null, data), 1);
    });
  }
});
