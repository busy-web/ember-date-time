import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import Time from 'busy-utils/time';

moduleForComponent('interfaces/time-picker', 'Integration | Component | time picker', {
  integration: true
});

test('it renders', function(assert) {

  this.set('timestamp', moment().unix());

  this.render(hbs`{{interfaces/time-picker timestamp=timestamp}}`);

  assert.ok(this.$().text().trim());
});

test('changes from hours to minutes', function(assert) {

  this.set('timestamp', moment().unix());
  this.set('isHourPicker', true);

  this.render(hbs`{{interfaces/time-picker timestamp=timestamp isHourPicker=isHourPicker}}`);

  assert.equal(this.$('.hours-header').hasClass('active'), true);
  assert.equal(this.$('.minutes-header').hasClass('inactive'), true);

  this.$('.minutes-header').click();

  assert.equal(this.$('.hours-header').hasClass('inactive'), true);
  assert.equal(this.$('.minutes-header').hasClass('active'), true);

});

test('changes from pm to am and back', function(assert) {

  this.set('timestamp', moment().unix());
  this.set('minuteOrHour', 'hour');

  this.render(hbs`{{interfaces/time-picker timestamp=timestamp minuteOrHour=minuteOrHour isMilliseconds=false instanceNumber="one"}}`);

  if (Time.date(this.get('timestamp')).format('A') === 'AM')
  {
      assert.equal(this.$('.am-button').hasClass('am-active'), true);
      assert.equal(this.$('.pm-button').hasClass('pm-inactive'), true);

      this.$('.pm-button').click();

      assert.equal(this.$('.pm-button').hasClass('pm-active'), true);
      assert.equal(this.$('.am-button').hasClass('am-inactive'), true);
  }
  else
  {
      assert.equal(this.$('.pm-button').hasClass('pm-active'), true);
      assert.equal(this.$('.am-button').hasClass('am-inactive'), true);

      this.$('.am-button').click();

      assert.equal(this.$('.am-button').hasClass('am-active'), true);
      assert.equal(this.$('.pm-button').hasClass('pm-inactive'), true);
  }
});

test('test hour and minute headers', function(assert) {

  this.set('timestamp', moment().unix());
  this.render(hbs`{{interfaces/time-picker timestamp=timestamp isMilliseconds=false instanceNumber="one"}}`);

  let hour = Time.date(this.get('timestamp')).hour();
  let minute = Time.date(this.get('timestamp')).minute();

  if (hour === 0 || hour === 12) { hour = '12';} else { hour = ('0' + (hour % 12)).slice(-2); }
  minute = ('0' + minute).slice(-2);

  assert.equal(this.$('.hours-header').text().trim(), hour);
  assert.equal(this.$('.minutes-header').text().trim(), minute);
});

test('click random minute sectionMin', function(assert) {

  this.set('timestamp', moment().unix());
  this.set('minuteOrHour', 'minute');

  this.render(hbs`{{interfaces/time-picker timestamp=timestamp minuteOrHour=minuteOrHour isMilliseconds=false instanceNumber="one"}}`);

  let randomSection = ('0' + Math.round(Math.random() * (60 - 1) + 1)).slice(-2);
  let id = '#sectionMin' + randomSection;

  this.$(id).click();

  assert.equal(this.$('.minutes-header').text().trim(), randomSection);
});
