import { moduleForComponent, test } from 'ember-qunit';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/date-picker', 'Unit | Component | private/date picker', {
  unit: true
});

const timestamp = moment().valueOf();

const stateManager = _state({
	timestamp: timestamp,
});

test('it renders', function(assert) {
  const args = { stateManager };
  this.subject(args);
  this.render();
  assert.ok(this.$().text().trim());
});

test('set timestamp', function(assert) {
  const args = { stateManager };
  let component = this.subject(args);
  let newTimestamp = moment().add('1', 'days');

  component.setTimestamp(newTimestamp);

  assert.equal(component.get('timestamp'), newTimestamp.valueOf());
});

test('set calendar date', function(assert) {
  const args = { stateManager };
  let component = this.subject(args);
  let newTimestamp = moment().add('6', 'days');

  component.setCalendarDate(newTimestamp);

	assert.equal(component.get('calendarDate'), newTimestamp.valueOf());
});
