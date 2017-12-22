/**
 * @module Utils/Clock
 *
 */
import { dasherize, underscore } from '@ember/string';
import { assert } from '@ember/debug';

/**
 * generates a meta data reference name
 *
 * @private
 * @method metaName
 * @params key {string} a key to generate the reference name with
 * @return {string}
 */
export function metaName(key) {
	assert(`metaName takes a string as an argument, you passed ${typeof key} ${key}`, typeof key === 'string' && key.trim().length);

	return `__${underscore(key)}__meta`;
}

/**
 * generates a css class reference key to the element in the DOM
 *
 * @private
 * @method elementName
 * @params key {string} a key to generate the reference name with
 * @return {string}
 */
export function elementName(key) {
	assert(`elementName takes a string as an argument, you passed ${typeof key} ${key}`, typeof key === 'string' && key.trim().length);

	return `.--svg-clock__${dasherize(key)}`;
}

/**
 * generates a number with a 0 for padding when the number is less than 10
 *
 * @private
 * @method formatNumber
 * @params num {number} the number to format
 * @return {string}
 */
export function numberToString(num) {
	assert(`numberToString takes a number as an argument, you passed ${typeof num} ${num}`, typeof num === 'number');

	return (num < 10 ? `0${num}` : `${num}`);
}

/**
	* Converts a string to an integer value
	*
	* @public
	* @method stringToInteger
	* @param value {string}
	* @return {number}
	*/
export function stringToNumber(str) {
	assert(`stringToNumber takes a string as an argument, you passed ${typeof str} ${str}`, typeof str === 'string');

	str = str.replace(/\D/g, '');
	return parseInt(str, 10);
}

