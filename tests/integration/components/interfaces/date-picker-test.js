import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('interfaces/date-picker', 'Integration | Component | date picker', {
  integration: true
});

test('it renders', function(assert) {

  this.set('timestamp', moment().unix() * 1000);

  this.render(hbs`{{interfaces/date-picker timestamp=timestamp isMilliseconds=true instanceNumber="one"}}`);

  assert.ok(this.$().text().trim());
});

test('check calender values', function(assert) {

  this.set('timestamp', moment().unix() * 1000);

  this.render(hbs`{{interfaces/date-picker timestamp=timestamp isMilliseconds=true instanceNumber="one"}}`);

  // assert.equal(this.$('.day-of-week').text().trim(), moment(this.get('timestamp')).format('dddd'));

  assert.equal(this.$('.date-picker-header-month').text().trim(), moment(this.get('timestamp')).format('MMM').toUpperCase());

  // assert.equal(this.$('.date-picker-header-day').text().trim(), moment(this.get('timestamp')).format('DD'));

  assert.equal(this.$('.date-picker-header-year').text().trim(), moment(this.get('timestamp')).format('YYYY'));

  assert.equal(this.$('.month-year').text().trim(), moment(this.get('timestamp')).format('MMM YYYY'));
});

test('add and subtract months from calender', function(assert) {

  this.set('timestamp', moment().unix() * 1000);
  this.set('calenderTimestampAdd', moment());
  this.set('calenderTimestampSubtract', moment());

  let addMonth = this.get('calenderTimestampAdd').add('1', 'months').format('MMM YYYY');
  let subtractMonth = this.get('calenderTimestampSubtract').subtract('1', 'months').format('MMM YYYY');

  this.render(hbs`{{interfaces/date-picker timestamp=timestamp isMilliseconds=true instanceNumber="one"}}`);

  this.$('.add-month').click();
  assert.equal(this.$('.month-year').text().trim(), addMonth);

  this.$('.subtract-month').click();
  this.$('.subtract-month').click();

  assert.equal(this.$('.month-year').text().trim(), subtractMonth);
});

test('click on day', function(assert) {

  this.set('timestamp', moment().startOf('month').unix() * 1000);
  this.set('nextDay', moment().startOf('month'));

  let firstDay = moment(this.get('timestamp')).date();

  this.render(hbs`{{interfaces/date-picker timestamp=timestamp isMilliseconds=true instanceNumber="one"}}`);

  this.$('.valid-day:first').click();

  assert.equal(this.$('.valid-day:first').html(), firstDay);
});
