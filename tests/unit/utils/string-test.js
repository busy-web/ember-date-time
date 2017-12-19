import {
	formatNumber,
	stringToInteger
} from 'dummy/utils/string';
import { module, test } from 'qunit';

module('Unit | Utility | string');

// Replace this with your real tests.
test('it works', function(assert) {
  assert.ok(formatNumber);
  assert.ok(stringToInteger);
});

test('formatNumber', function(assert) {
  assert.equal(formatNumber(3), '03', 'format number adds plaeholder 0 to less than 10 integers');
  assert.equal(formatNumber(11), '11', 'format number doe not add plaeholder 0 to greater than 9 integers');
});

test('stringToInteger', function(assert) {
  assert.equal(stringToInteger('03'), 3, 'stringToInteger returned correct number');
  assert.equal(stringToInteger('12'), 12, 'stringToInteger returned correct number');
});
