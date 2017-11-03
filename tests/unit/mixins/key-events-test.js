import EmberObject from '@ember/object';
import KeyEventsMixin from 'ember-paper-time-picker/mixins/key-events';
import { module, test } from 'qunit';

module('Unit | Mixin | key events');

// Replace this with your real tests.
test('it works', function(assert) {
  let KeyEventsObject = EmberObject.extend(KeyEventsMixin);
  let subject = KeyEventsObject.create();
  assert.ok(subject);
});
