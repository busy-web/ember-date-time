import EmberObject from '@ember/object';
import InputNumbersMixin from 'ember-paper-time-picker/mixins/input-numbers';
import { module, test } from 'qunit';

module('Unit | Mixin | input numbers');

// Replace this with your real tests.
test('it works', function(assert) {
  let InputNumbersObject = EmberObject.extend(InputNumbersMixin);
  let subject = InputNumbersObject.create();
  assert.ok(subject);
});
