import TimePicker from 'dummy/utils/time-picker';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Utility | time picker');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = TimePicker.create();
  assert.ok(result);
});

test('test formatHourHeader', function(assert) {
  const randInt =  Math.floor(Math.random() * (11 - 0 + 1)) + 0;
  const hour1 = TimePicker.formatHourHeader(randInt);
  const header = randInt === 0 ? '12' : ('0' + randInt).slice(-2);

  assert.equal(header, hour1);

  assert.throws(() => { TimePicker.formatHourHeader({'hour': 12}); }, /formatHourHeader param must be a string or integer/, 'formatHourHeader param must be a string or integer');
});

test('test formatMinuteStrings', function(assert) {
  const randInt =  Math.floor(Math.random() * (59 - 0 + 1)) + 0;
  const minute = TimePicker.formatMinuteStrings(randInt);
  const returnVal = randInt === 0 ? '00' : ('0' + randInt).slice(-2);

  assert.equal(returnVal, minute);

  assert.throws(() => { TimePicker.formatMinuteStrings(true); }, /formatMinuteStrings param must be a string or integer/, 'formatMinuteStrings only takes integers or strings');
});

test('test formatHourStrings', function(assert) {
  const randInt =  Math.floor(Math.random() * (11 - 0 + 1)) + 0;
  const hour = TimePicker.formatHourStrings(randInt);
  const returnVal = randInt === 0 ? '00' : ('0' + randInt).slice(-2);

  assert.equal(returnVal, hour);

  assert.throws(() => { TimePicker.formatHourStrings(['test', true]); }, /formatHourStrings param must be a string or integer/, 'formatHourStrings only takes integers or strings');
});

test('test stringToSlicedInteger', function(assert) {
  const randInt = ('0' +  (Math.floor(Math.random() * (99 - 0 + 1)) + 0)).slice(-2);
  const randString = '123456789' + randInt;
  const integer = TimePicker.stringToSlicedInteger(randString);

  assert.equal(randInt, integer);

  assert.throws(() => { TimePicker.stringToSlicedInteger(1000); }, /Type error/, 'Type error');
});

test('test hourStrings', function(assert) {
  const randHour =  Math.floor(Math.random() * (11 - 0 + 1)) + 0;

  const hours = {
    text: 'hour' + randHour,
    line: 'line' + randHour,
    circle: 'circle' + randHour
  };

  const strings = TimePicker.hourStrings(randHour);

  assert.equal(hours.text, strings.text);
  assert.equal(hours.line, strings.line);
  assert.equal(hours.circle, strings.circle);

  assert.throws(() => { TimePicker.hourStrings({'test': null}); }, /hourStrings param must be a string or integer/, 'hourStrings only takes strings and integers');

});

test('test minuteStrings', function(assert) {
  const randMinutes =  Math.floor(Math.random() * (59 - 0 + 1)) + 0;

  const minutes = {
    text: 'minText' + randMinutes,
    line: 'minLine' + randMinutes,
    circle: 'minCircle' + randMinutes
  };

  const strings = TimePicker.minuteStrings(randMinutes);

  assert.equal(minutes.text, strings.text);
  assert.equal(minutes.line, strings.line);
  assert.equal(minutes.circle, strings.circle);

  assert.throws(() => { TimePicker.minuteStrings(false); }, /minuteStrings param must be a string or integer/, 'minuteStrings only takes strings and integers');
});

test('test minuteModFive', function(assert) {
  const randInt =  Math.floor(Math.random() * (1000 - 0 + 1)) + 0;
  const bool = randInt % 5 === 0 ? true : false;
  const returnVal = TimePicker.minuteModFive(randInt);

  assert.equal(bool, returnVal);

  assert.throws(() => { TimePicker.minuteModFive([5]); }, /minuteModFive param must be a string or integer/, 'minuteModFive only takes strings and integers');
});

test('test currentHour', function(assert) {
  const timestamp =  moment().unix() * 1000;
  const hour = ('0' + (moment(timestamp).hour() % 12)).slice(-2);
  const returnVal = TimePicker.currentHour(moment(timestamp));

  assert.equal(hour, returnVal);

  assert.throws(() => { TimePicker.currentHour('test'); }, /Type error/, 'Type error');
});

test('test currentMinute', function(assert) {
  const timestamp =  moment().unix() * 1000;
  const minute = ('0' + moment(timestamp).minute()).slice(-2);
  const returnVal = TimePicker.currentMinute(moment(timestamp));

  assert.equal(minute, returnVal);

  assert.throws(() => { TimePicker.currentMinute('test'); }, /Type error/, 'Type error');
});

test('test currentDateFormat', function(assert) {
  const timestamp =  moment().unix() * 1000;
  const date = moment(timestamp).format('MMM DD, YYYY');
  const returnVal = TimePicker.currentDateFormat(moment(timestamp));

  assert.equal(date, returnVal);

  assert.throws(() => { TimePicker.currentDateFormat('test'); }, /Type error/, 'Type error');
});

test('test timeIsAm', function(assert) {
  const timestamp =  moment().unix() * 1000;
  const meridian = moment(timestamp).format('A');
  const bool = meridian === 'AM' ? true : false;
  const returnVal = TimePicker.timeIsAm(moment(timestamp));

  assert.equal(bool, returnVal);

  assert.throws(() => { TimePicker.timeIsAm('test'); }, /Type error/, 'Type error');
});
