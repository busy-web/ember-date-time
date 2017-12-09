/**
 * @module Utils
 *
 */

/**
	* Adds a zero to numbers below 10
	*
	* @public
	* @method formatTime
	* @param value {number|string}
	* @return {string}
	*/
export function formatNumber(value) {
	if (typeof value === 'string') {
		value = stringToInteger(value);
	}
	return (value < 10) ? `0${value}` : `${value}`;
}

/**
	* Converts a string to an integer value
	*
	* @public
	* @method stringToInteger
	* @param value {string}
	* @return {number}
	*/
export function stringToInteger(value) {
	value = value.replace(/\D/g, '');
	return parseInt(value, 10);
}

