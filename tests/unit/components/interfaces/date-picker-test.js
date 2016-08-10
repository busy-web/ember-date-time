import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';

moduleForComponent('interfaces/date-picker', 'Unit | Component | interfaces/date picker', {
  needs: ['helper:format-day'],
  unit: true
});

test('it renders', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  this.subject(args);
  this.render();
  assert.ok(this.$().text().trim());
});

test('set timestamp', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  let component = this.subject(args);

  let newTimestamp = moment().add('1', 'days');
  component.setTimestamp(newTimestamp);

  assert.equal(component.get('timestamp'), newTimestamp.unix() * 1000);
});

test('set calender date', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  let component = this.subject(args);

  let newTimestamp = moment().add('6', 'days');
  component.setCalenderDate(newTimestamp);

  assert.equal(component.get('calenderDate'), newTimestamp.unix() * 1000);
});
