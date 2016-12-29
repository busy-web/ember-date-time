import TimePicker from 'dummy/utils/time-picker';
import { module, test } from 'qunit';

module('Unit | Utility | time picker');

// Replace this with your real tests.
test('it works', function(assert) {
  assert.ok(TimePicker);
  assert.ok(TimePicker.formatNumber);
  assert.ok(TimePicker.stringToInteger);
  assert.ok(TimePicker.elementNames);
});

test('test formatNumber', function(assert) {
  assert.equal('01', TimePicker.formatNumber(1));
  assert.equal('02', TimePicker.formatNumber(2));
  assert.equal('03', TimePicker.formatNumber(3));
  assert.equal('04', TimePicker.formatNumber(4));
  assert.equal('05', TimePicker.formatNumber(5));
  assert.equal('06', TimePicker.formatNumber(6));
  assert.equal('07', TimePicker.formatNumber(7));
  assert.equal('08', TimePicker.formatNumber(8));
  assert.equal('09', TimePicker.formatNumber(9));
  assert.equal('10', TimePicker.formatNumber(10));
  assert.equal('15', TimePicker.formatNumber(15));
});

test('test stringToInteger', function(assert) {
	assert.equal(1, TimePicker.stringToInteger('test-01'));
	assert.equal(10, TimePicker.stringToInteger('test-010'));
	assert.equal(10, TimePicker.stringToInteger('test-10'));
	assert.equal(1, TimePicker.stringToInteger('01'));
	assert.equal(10, TimePicker.stringToInteger('010'));
	assert.equal(10, TimePicker.stringToInteger('10'));
});

test('test elementNames', function(assert) {
	const strings = TimePicker.elementNames('hours', 12);
	assert.equal('hours-text-12', strings.text);
	assert.equal('hours-line-12', strings.line);
	assert.equal('hours-circle-12', strings.circle);
	assert.equal('section-hours-12', strings.section);
});
