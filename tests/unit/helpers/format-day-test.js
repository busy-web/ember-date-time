import { formatDay } from 'dummy/helpers/format-day';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Helper | format day');

// test for if it exists
test('it works', function(assert) {
	// make sure that format day exists and is a function
	assert.ok(typeof formatDay === 'function');
});

// tests for the method params passed in.
test('allow paremeter type', function(assert) {

	// todays date
	const today = moment().date();

	// test if a moment object can be passes in.
	assert.deepEqual(formatDay([moment()]), today, 'formatDay allows a moment date object to be passed in');

	// test if formatDay returns a default day?
	assert.deepEqual(formatDay([]), today, 'formatDay returns a default date if not provided');

	// test if there is an error thrown when the wrong date format is passed in.
	assert.throws(() => { formatDay([new Date()]); }, /param 1 must be a moment date/, 'formatDay does not allow js date objects');

	// test if there is an error thrown when a date string is passed in.
	assert.throws(() => { formatDay(['2016-05-04 00:00:00']); }, /param 1 must be a moment date/, 'formatDay does not allow string dates');

	// test if there is an error thrown when a number is passed in
	assert.throws(() => { formatDay([10]); }, /param 1 must be a moment date/, 'formatDay does not allow number dates');
});

test('method return type', function(assert) {
	const today = moment().date();

	// check if formatDay returns a number
	assert.deepEqual(typeof formatDay([moment()]), 'number', 'formatDay returns a number');

	// check if formatDay returns the correct result
	assert.deepEqual(formatDay([moment()]), today, 'formatDay returns the correct result');
});
