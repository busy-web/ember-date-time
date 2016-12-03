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

  // assert.throws(() => { TimePicker.formatHourHeader({'hour': 12}); }, /formatHourHeader param must be a string or integer/, 'formatHourHeader param must be a string or integer');
});

test('test minuteModFive', function(assert) {
  const randInt =  Math.floor(Math.random() * (1000 - 0 + 1)) + 0;
  const bool = randInt % 5 === 0 ? true : false;
  const returnVal = TimePicker.minuteModFive(randInt);

  assert.equal(bool, returnVal);

  // assert.throws(() => { TimePicker.minuteModFive([5]); }, /minuteModFive param must be a string or integer/, 'minuteModFive only takes strings and integers');
});
