import { formatDay } from 'dummy/helpers/format-day';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Helper | format day');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = formatDay([moment()]);
  assert.ok(result);
});
