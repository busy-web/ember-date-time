import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import moment from 'moment';

moduleForComponent('interfaces/date-picker', 'Integration | Component | Interfaces | DatePicker', {
  integration: true
});

const timestamp = moment().valueOf();

const paper = paperDate({
	timestamp: timestamp,
});

const calendar = paperDate({
	timestamp: timestamp,
});

const activeState = EmberObject.create({
	state: '',
	isOpen: false,
	isTop: false,
});

test('it renders', function(assert) {
	this.set('paper', paper);
	this.set('calendar', calendar);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/date-picker paperDate=paper paperCalendar=calender activeState=activeState}}`);

  assert.ok(this.$().text().trim());
});

test('check calender values', function(assert) {
	this.set('paper', paper);
	this.set('calendar', calendar);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/date-picker paperDate=paper paperCalendar=calender activeState=activeState}}`);

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

	this.set('paper', paper);
	this.set('calendar', calendar);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/date-picker paperDate=paper paperCalendar=calender activeState=activeState}}`);

  this.$('.add-month').click();
  assert.equal(this.$('.month-year').text().trim(), addMonth, 'Add 1 month');

  this.$('.subtract-month').click();
  this.$('.subtract-month').click();
  assert.equal(this.$('.month-year').text().trim(), subtractMonth, 'Subtract 1 month');
});

test('click on day', function(assert) {
	this.set('paper', paper);
	this.set('calendar', calendar);
	this.set('activeState', activeState);
  this.set('nextDay', moment().startOf('month'));

  this.render(hbs`{{interfaces/date-picker paperDate=paper paperCalendar=calender activeState=activeState}}`);

	const prevDay = this.$('.day.current').prev();
  prevDay.click();

  assert.equal(this.$('.day.current').text().trim(), prevDay.text().trim());
});
