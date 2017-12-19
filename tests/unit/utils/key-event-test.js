import keyEvent from 'dummy/utils/key-event';
import { module, test } from 'qunit';

module('Unit | Utility | key event');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = keyEvent;
  assert.ok(result);
});

test('test key input', function(assert) {
  let result = keyEvent({ event: { keyCode: 13, target: {} } });
  assert.equal(result.keyName, 'Enter', 'enter key returned');
});
