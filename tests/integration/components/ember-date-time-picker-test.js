import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('ember-date-time-picker', 'Integration | Component | ember date time picker', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('timestamp', moment().unix() * 1000);

  this.render(hbs`{{ember-date-time-picker timestamp=timestamp}}`);

  assert.equal(this.$().text().trim(), '');
});
