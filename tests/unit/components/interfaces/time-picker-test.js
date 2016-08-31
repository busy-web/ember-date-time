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


test('hourOverMaxMin', function(assert) {

  const time = moment().unix() * 1000;
  const min = (moment().subtract('6', 'hours')).unix() * 1000;
  const max = (moment().add('6', 'hours')).unix() * 1000;

  const args = {'timestamp': time, 'minDate': min, 'maxDate': max};

  let component = this.subject(args);

  this.subject(args);
  let hour = Math.floor(Math.random() * (12 - 1 + 1)) + 1;
  let returnVal = component.hourOverMaxMin(hour);
  let setHour = null;

  if (moment(time).format('A') === 'AM')
  {
    setHour = moment(time).hour(hour);
  }
  else
  {
    setHour = moment(time).hour(hour + 12);
  }

  let customVal = null;
  if (!setHour.isBefore(moment(min)) && !setHour.isAfter(moment(max)))
  {
    customVal = true;
  }
  else
  {
      customVal = false;
  }

  assert.equal(returnVal, customVal);

  assert.throws(() => { component.hourOverMaxMin({'test': test}); }, /hourOverMaxMin param must be an integer or string/, "hourOverMaxMin param must be an integer or string");
});

test('minuteOverMaxMin', function(assert) {

  const time = moment().unix() * 1000;
  const min = (moment().subtract('45', 'minutes')).unix() * 1000;
  const max = (moment().add('45', 'minutes')).unix() * 1000;

  const args = {'timestamp': time, 'minDate': min, 'maxDate': max};

  let component = this.subject(args);
  this.subject(args);

  let minute = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  let returnVal = component.minuteOverMaxMin(minute);
  let setMin = moment(time).minute(minute);
  let customVal = setMin.isBetween(min, max);

  assert.equal(returnVal, customVal);
  assert.throws(() => { component.minuteOverMaxMin({'test': test}); }, /minuteOverMaxMin param must be an integer or string/, "minuteOverMaxMin param must be an integer or string");
});
