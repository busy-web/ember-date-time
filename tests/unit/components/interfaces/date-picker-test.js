import { moduleForComponent, test } from 'ember-qunit';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import moment from 'moment';

moduleForComponent('interfaces/date-picker', 'Unit | Component | interfaces/date picker', {
  unit: true
});

const timestamp = moment().valueOf();

const paper = paperDate({
	timestamp: timestamp,
});

const calendar = paperDate({
	timestamp: timestamp,
});

test('it renders', function(assert) {
  const args = {
		paperDate: paper,
		paperCalendar: calendar
	};

  this.subject(args);
  this.render();
  assert.ok(this.$().text().trim());
});

test('set timestamp', function(assert) {
  const args = {
		paperDate: paper,
		paperCalendar: calendar
	};

  let component = this.subject(args);
  let newTimestamp = moment().add('1', 'days');

  component.setTimestamp(newTimestamp);

  assert.equal(component.get('timestamp'), newTimestamp.valueOf());
});

test('set calendar date', function(assert) {
  const args = {
		paperDate: paper,
		paperCalendar: calendar
	};

  let component = this.subject(args);
  let newTimestamp = moment().add('6', 'days');

  component.setCalendarDate(newTimestamp);

	assert.equal(component.get('calendarDate'), newTimestamp.valueOf());
});
