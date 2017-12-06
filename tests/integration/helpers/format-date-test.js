
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('format-date', 'helper:format-date', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', Date.now());

  this.render(hbs`{{format-date inputValue "MM-DD-YYYY"}}`);

  assert.equal(this.$().text().trim(), moment(this.get('inputValue')).format('MM-DD-YYYY'));
});

