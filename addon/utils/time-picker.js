/**
 * @module utils
 *
 */
import Ember from 'ember';
import Assert from 'busy-utils/assert';

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
	}
});
