/**
 * @module utils
 *
 */
import Ember from 'ember';
import { Assert } from 'busy-utils';
import moment from 'moment';

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
	isDateInBounds(date, minDate, maxDate) {
		Assert.funcNumArgs(arguments, 3);
		Assert.isMoment(date);

		const isBefore = this.isDateBefore(date, minDate);
		const isAfter = this.isDateAfter(date, maxDate);

		return { isBefore, isAfter };
	},

	isDateBefore(date, minDate) {
		Assert.funcNumArgs(arguments, 2);
		Assert.isMoment(date);

		let isBefore = false;
		if (!Ember.isNone(minDate)) {
			if (typeof minDate === 'number' && !isNaN(minDate)) {
				minDate = this.getMomentDate(minDate);
			}

			if (typeof minDate === 'object' && this.isValidDate(minDate)) {
				isBefore = date.isBefore(minDate);
			} else {
				Assert.throw('Invalid minDate passed to isDateInBounds');
			}
		}
		return isBefore;
	},

	isDateAfter(date, maxDate) {
		Assert.funcNumArgs(arguments, 2);
		Assert.isMoment(date);

		let isAfter = false;
		if (!Ember.isNone(maxDate)) {
			if (typeof maxDate === 'number' && !isNaN(maxDate)) {
				maxDate = this.getMomentDate(maxDate);
			}

			if (typeof maxDate === 'object' && this.isValidDate(maxDate)) {
				isAfter = date.isAfter(maxDate);
			} else {
				Assert.throw('Invalid maxDate passed to isDateInBounds');
			}
		}
		return isAfter;
	},

	/**
	 * Get a monent object from a timestamp that could be seconds or milliseconds
	 *
	 * @public
	 * @method getMomentDate
	 * @param timestamp {number}
	 * @return {moment}
	 */
	getMomentDate(timestamp) {
		Assert.funcNumArgs(arguments, 1);

		let date = null;
		if (!Ember.isNone(timestamp)) {
			Assert.isNumber(timestamp);

			date = moment(timestamp);

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
    return (!Ember.isNone(date) && typeof date === 'object' && moment.isMoment(date) && date.isValid());
	},

	/**
	 * validates a timestamp or unix timestamp
	 *
	 * @public
	 * @method isValidTimestamp
	 * @param timestamp {number}
	 * @return {boolean}
	 */
	isValidTimestamp(timestamp) {
		let isValid = false;
		if (typeof timestamp === 'number' && !isNaN(timestamp)) {
			const date = this.getMomentDate(timestamp);
			isValid = this.isValidDate(date);
		}
		return isValid;
	},

	getUnix(timestamp) {
		return moment(timestamp).unix();
	},

	getTimstamp(unix) {
		return moment.unix(unix).valueOf();
	},

	utcToLocal(timestamp, isUnix=false) {
		let time = timestamp;
		if (isUnix) {
			time = TimePicker.getTimstamp(timestamp);
		}

		const offset = moment.utc(time).local().utcOffset();
		const date = moment.utc(time).subtract(offset, 'minutes');

		if (isUnix) {
			return date.unix();
		} else {
			return date.valueOf();
		}
	},

	utcFromLocal(timestamp, isUnix=false) {
		let time = timestamp;
		if (isUnix) {
			time = TimePicker.getTimstamp(timestamp);
		}

		const offset = moment(time).utcOffset();
		const date = moment(time).add(offset, 'minutes');

		if (isUnix) {
			return date.unix();
		} else {
			return date.valueOf();
		}
	},
});
