import {
	longFormatDate,
	splitFormat,
	getCursorPosition,
	getFormatSection,
	findSectionIndex
} from 'dummy/utils/format';
import { module, test } from 'qunit';

module('Unit | Utility | format');

// Replace this with your real tests.
test('it works', function(assert) {
  assert.ok(longFormatDate);
  assert.ok(splitFormat);
  assert.ok(getCursorPosition);
  assert.ok(getFormatSection);
  assert.ok(findSectionIndex);
});
