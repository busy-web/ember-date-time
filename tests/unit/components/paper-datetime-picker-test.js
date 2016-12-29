import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';

moduleForComponent('paper-datetime-picker', 'Unit | Component | paper-datetime-picker', {
	needs: ['component:interfaces/combined-picker', 'component:interfaces/date-picker', 'component:interfaces/time-picker'],
  unit: true
});

test('it renders', function(assert) {
  const timestamp = moment().valueOf();

  this.subject({ timestamp });
  this.render();
  assert.ok(this.$().text().trim());
});
