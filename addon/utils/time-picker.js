/**
 * @module utils
 *
 */
import Ember from 'ember';
import { Assert } from 'busy-utils';
import moment from 'moment';
import PaperDate from 'ember-paper-time-picker/utils/paper-date';

/***/
const TimePicker = Ember.Object.extend();

/**
 * `Util/TimePicker`
 *
 */
export default TimePicker.reopenClass({

	/**
	 * Adds a zero to numbers below 10
	 *
	 * @public
	 * @method formatTime
	 * @param value {number|string}
	 * @return {string}
	 */
	formatNumber(value) {
		if (typeof value === 'string') {
			value = this.stringToInteger(value);
		}

		Assert.isNumber(value);
		return (value < 10) ? `0${value}` : `${value}`;
	},

	/**
	 * Converts a string to an integer value
	 *
	 * @public
	 * @method stringToInteger
	 * @param value {string}
	 * @return {number}
	 */
	stringToInteger(value) {
		Assert.isString(value);
		value = value.replace(/\D/g, '');
		return parseInt(value, 10);
	},

	/**
	 * Returns a set of id names for a given time integer
	 *
	 * @public
	 * @method elementNames
	 * @param type {string}
	 * @param value {number}
	 * @return {object}
	 */
	elementNames(type, value) {
		value = this.formatNumber(value);
		return {
			"text": `${type}-text-${value}`,
			"line": `${type}-line-${value}`,
			"circle": `${type}-circle-${value}`,
			"section": `section-${type}-${value}`
		};
	},

	/**
	 * checks if a timestamp is within the min and max dates
	 *
	 * returns an object with isBefore and isAfter boolean values
	 *
	 * @public
	 * @method isDateInBounds
	 * @param date {moment} moment date object
	 * @param minDate {number|Moment}
	 * @param maxDate {number|Moment}
	 * @return {object|} {isBefore: boolean, isAfter: boolean}
	 */
	isDateInBounds(date, minDate, maxDate, isMilliseconds=false) {
		Assert.funcNumArgs(arguments, 4);
		Assert.isMoment(date);

		let isBefore = false;
		if (!Ember.isNone(minDate)) {
			if (typeof minDate === 'number' && !isNaN(minDate)) {
				minDate = this.getMomentDate(minDate, isMilliseconds);
			}

			if (typeof minDate === 'object' && this.isValidDate(minDate)) {
				isBefore = date.isBefore(minDate);
			} else {
				Assert.throw('Invalid minDate passed to isDateInBounds');
			}
		}

		let isAfter = false;
		if (!Ember.isNone(maxDate)) {
			if (typeof maxDate === 'number' && !isNaN(maxDate)) {
				maxDate = this.getMomentDate(maxDate, isMilliseconds);
			}

			if (typeof maxDate === 'object' && this.isValidDate(maxDate)) {
				isAfter = date.isAfter(maxDate);
			} else {
				Assert.throw('Invalid maxDate passed to isDateInBounds');
			}
		}

		return { isBefore, isAfter };
	},

	/**
	 * Get a monent object from a timestamp that could be seconds or milliseconds
	 *
	 * @public
	 * @method getMomentDate
	 * @param timestamp {number}
	 * @return {moment}
	 */
	getMomentDate(timestamp, isMilliseconds=false) {
		Assert.funcNumArgs(arguments, 2);

		let date = null;
		if (!Ember.isNone(timestamp)) {
			Assert.isNumber(timestamp);
			Assert.isBoolean(isMilliseconds);

			if (isMilliseconds) {
				date = moment.utc(timestamp);
			} else {
				date = moment.utc(timestamp*1000);
			}

			// ensure the timestamp passed in created a valid date
			Assert.isMoment(date);
		}
		return date;
	},

	/**
	 * validates a moment date object
	 *
	 * @public
	 * @method isValidDate
	 * @param date {Moment}
	 * @return {boolean}
	 */
	isValidDate(date) {
		Assert.isObject(date);
    return (moment.isMoment(date) && date.isValid());
	},

	createPaperDate(options) {
		const date = PaperDate.create();

		if (options.timestamp && !options.unix) {
			options.unix = Math.floor(options.timestamp/1000);
		}

		if (options.unix && !options.timestamp) {
			options.timestamp = options.unix * 1000;
		}

		if (options.timestamp && !options.date) {
			Assert.isNumber(options.timestamp);
			options.date = this.getMomentDate(options.timestamp, true);
		}

		if (options.date && !options.dayOfMonth) {
			Assert.isMoment(options.date);
			options.dayOfMonth = options.date.date();
		}

		date.setProperties(options);
		return date;
	},
});
