import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/date-picker', 'Integration | Component | private/date picker', {
  integration: true
});

const timestamp = moment().valueOf();

test('it renders', function(assert) {
	const stateManager = _state({ timestamp, state: '', isOpen: false, isTop: false });
	this.set('stateManager', stateManager);

  this.render(hbs`{{private/date-picker stateManager=stateManager}}`);

  assert.ok(this.$().text().trim());
});

test('check calender values', function(assert) {
	const stateManager = _state({ timestamp, state: '', isOpen: false, isTop: false });
	this.set('stateManager', stateManager);

  this.render(hbs`{{private/date-picker stateManager=stateManager}}`);

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

	const stateManager = _state({ timestamp, state: '', isOpen: false, isTop: false });
	this.set('stateManager', stateManager);

	this.render(hbs`{{private/date-picker stateManager=stateManager}}`);

  this.$('.add-month').click();
  assert.equal(this.$('.month-year').text().trim(), addMonth, 'Add 1 month');

  this.$('.subtract-month').click();
  this.$('.subtract-month').click();
  assert.equal(this.$('.month-year').text().trim(), subtractMonth, 'Subtract 1 month');
});

test('click on day', function(assert) {
	const stateManager = _state({ timestamp, state: '', isOpen: false, isTop: false });
	this.set('stateManager', stateManager);
  this.set('nextDay', moment().startOf('month'));

	this.set('clickAction', (state, time) => {
		assert.equal(moment(time).date() + '', prevDay.text().trim());
	});

  this.render(hbs`{{private/date-picker stateManager=stateManager onUpdate=clickAction}}`);

	const prevDay = this.$('.week-row > .day.current').prev();
  prevDay.click();
});

