import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/date-picker', 'Integration | Component | private/date picker', {
  integration: true
});

const timestamp = moment().valueOf();
const activeState = _state({
	timestamp: timestamp,
	state: '',
	isOpen: false,
	isTop: false,
});

test('it renders', function(assert) {
	this.set('activeState', activeState);

  this.render(hbs`{{private/date-picker activeState=activeState}}`);

  assert.ok(this.$().text().trim());
});

test('check calender values', function(assert) {
	this.set('activeState', activeState);

  this.render(hbs`{{private/date-picker activeState=activeState}}`);

  assert.equal(this.$('.month-container > .week-day').text().trim(), moment(this.get('paper.timestamp')).format('ddd') + ',', 'Day of the week');
	assert.equal(this.$('.month-container > .month').text().trim(), moment(this.get('paper.timestamp')).format('MMM'), 'Month');
	assert.equal(this.$('.month-container > .day').text().trim(), moment(this.get('paper.timestamp')).format('DD'), 'Day');
  assert.equal(this.$('.date-picker-header-year').text().trim(), moment(this.get('paper.timestamp')).format('YYYY'), 'Year');
  assert.equal(this.$('.month-year').text().trim(), moment(this.get('paper.timestamp')).format('MMMM YYYY'), 'Month Year');
});

test('add and subtract months from calender', function(assert) {
  this.set('calenderTimestampAdd', moment());
  this.set('calenderTimestampSubtract', moment());

  let addMonth = this.get('calenderTimestampAdd').add('1', 'months').format('MMMM YYYY');
  let subtractMonth = this.get('calenderTimestampSubtract').subtract('1', 'months').format('MMMM YYYY');

	this.set('activeState', activeState);

	this.render(hbs`{{private/date-picker activeState=activeState}}`);

  this.$('.add-month').click();
  assert.equal(this.$('.month-year').text().trim(), addMonth, 'Add 1 month');

  this.$('.subtract-month').click();
  this.$('.subtract-month').click();
  assert.equal(this.$('.month-year').text().trim(), subtractMonth, 'Subtract 1 month');
});

test('click on day', function(assert) {
	this.set('activeState', activeState);
  this.set('nextDay', moment().startOf('month'));

	this.set('clickAction', (state, time) => {
		assert.equal(moment(time).date() + '', prevDay.text().trim());
	});

  this.render(hbs`{{private/date-picker activeState=activeState onUpdate=clickAction}}`);

	const prevDay = this.$('.week-row > .day.current').prev();
  prevDay.click();
});

