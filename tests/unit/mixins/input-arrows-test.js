import EmberObject from '@ember/object';
import InputArrowsMixin from 'ember-paper-time-picker/mixins/input-arrows';
import { module, test } from 'qunit';

module('Unit | Mixin | input arrows');

// Replace this with your real tests.
test('it works', function(assert) {
  let InputArrowsObject = EmberObject.extend(InputArrowsMixin);
  let subject = InputArrowsObject.create();
  assert.ok(subject);
});
