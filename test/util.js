const assert = require('chai').assert;
const sinon = require('sinon');

const u = require('utils');

describe('The Data Cache', function() {
  // Test parameters...
  const TEST_VALUE = 'stuff';
  const TEST_KEY = 'internalKey';
  const testFunc = sinon.stub().returns(TEST_VALUE);

  const cache = new u.Cache();
  const value = cache.getValue(TEST_KEY, testFunc);

  it('Invokes the user function when no data cached', function() {
    assert(value === TEST_VALUE, 'Incorrect value returned!');
    assert(testFunc.calledOnce);
  });

  it('Only invokes the user function once', function() {
    const newValue = cache.getValue(TEST_KEY, testFunc);
    assert(newValue === TEST_VALUE, 'Incorrect value returned!');
    assert(testFunc.calledOnce, 'Test function called multiple times!');
  });

  it('Reset allows the function to be called on next access', function() {
    cache.reset(TEST_KEY);
    const newValue = cache.getValue(TEST_KEY, testFunc);
    assert(newValue === TEST_VALUE, 'Incorrect value returned!');
    assert(testFunc.calledTwice, 'Test function not called after reset!');
  });
});
