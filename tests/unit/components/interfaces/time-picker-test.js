import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';

moduleForComponent('interfaces/time-picker', 'Unit | Component | interfaces/time picker', {
  needs: ['util:snap-utils', 'util:time-picker'],
  unit: true
});

test('it renders', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  this.subject(args);
  this.render();
  assert.ok(this.$().text().trim());
});

test('set minute to timestamp', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  let component = this.subject(args);
  let minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;

  component.setMinuteToTimestamp(minute);

  assert.equal(moment(component.get('timestamp')).minute(), minute);

  assert.throws(() => { component.setMinuteToTimestamp('test'); }, /setMinuteToTimestamp param must be an integer/, 'setTimestamp only takes integers');
});

test('convertToTimestamp', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  let component = this.subject(args);
  let momentObject = moment().add('1', 'hour');
  let unix = momentObject.unix() * 1000;

  this.subject(args);

  component.convertToTimestamp(momentObject);

  assert.equal(component.get('timestamp'), unix);

  assert.throws(() => { component.convertToTimestamp(26543216584); }, /convertToTimestamp param must be a valid moment object/, 'convertToTimestamp only takes moment objects');
});
