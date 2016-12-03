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

	elementNames(type, value) {
		value = this.formatNumber(value);
		return {
			"text": `${type}-text-${value}`,
			"line": `${type}-line-${value}`,
			"circle": `${type}-circle-${value}`
		};
	},

	/**
	 * returns object with names of all hour strings
	 *
	 * @private
	 * @method hourStrings
	 * @param value {number|string} hour you want strings of
	 * @return {object} all passed in hour strings
	 */
	hourStrings(value) {
		value = this.formatNumber(value);
		return {
			"text": `hour-${value}`,
			"line": `line-${value}`,
			"circle": `circle-${value}`
		};
	},

  /**
   * returns object with names of all minute strings
   *
   * @private
   * @method minuteStrings
   * @param value {number|string} minute you want strings of
   * @return {object} all passed in minute strings
   */
  minuteStrings(value) {
		value = this.formatNumber(value);
		return {
			"text": `min-text-${value}`,
			"line": `min-line-${value}`,
			"circle": `min-circle-${value}`
		};
  },

  /**
   * returns true if the minute is a multiple of five
   *
   * @private
   * @method minuteModFive
   * @param minute {number} minute to check if multiple of 5
   * @return {boolean} returns true if minute is a multiple of 5
   */
  minuteModFive(value) {
		Assert.isNumber(value);

		return (value % 5 === 0);
  },

  /**
   * gets the angle at which the drag is taking place
   *
   * @private
   * @method angle
   * @param x {number} point 1 x value
   * @param y {number} point 1 y value
   * @param x2 {number} point 2 x value
   * @param y2 {number} point 2 y value
   * @return {number} angle from point 1 to point 2
   */
  angle(x, y, x2, y2) {
    let p0 = Math.sqrt(Math.pow(0-x, 2)+Math.pow(0-y, 2));
    let p1 = Math.sqrt(Math.pow(0-x2, 2)+Math.pow(0-y2, 2));
    let p2 = Math.sqrt(Math.pow(x2-x, 2)+Math.pow(y2-y, 2));

    return (Math.acos(((p1*p1)+(p0*p0)-(p2*p2))/(2*(p1*p0)))*360)/(2*Math.PI);
  }
});
