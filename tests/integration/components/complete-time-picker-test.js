import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('complete-time-picker', 'Integration | Component | complete time picker', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{complete-time-picker}}`);

  let date = moment().format('MMM DD, YYYY');
  let time = moment().format('hh:mm A');

  assert.equal(this.$('#current-date-date').text(), date);

  this.$('#current-date-date').click();

  assert.equal(this.$('#current-date-time').text(), time);
});
