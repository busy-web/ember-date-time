/**
 * @module Utils
 *
 */
import { isEmpty } from '@ember/utils';
import moment from 'moment';

// regular expression to split date format into format sections
const REGX = new RegExp(/[/.\-, :]+/);

/**
 * Returns the long format for localized formats like `ll`
 *
 * @public
 * @method longFormatDate
 * @param format {string} moment format string
 * @return {string} moment format string
 */
export function longFormatDate(format) {
	const localeData = moment.localeData();
	let parts = format.split(' ');

	let lf = parts.reduce((a, b) => {
		let str = localeData.longDateFormat(b)
		if (!isEmpty(str)) {
			return a + ' ' + str;
		}
		return a;
	}, '');

	lf = lf.trim();
	if (!isEmpty(lf)) {
		format = lf;
	}
	return format;
}

/**
 * split string into smaller moment format types like `dd` and `mm`
 *
 * @public
 * @method splitFormat
 * @param str {string} moment format string
 * @return {string[]} moment format parts
 */
export function splitFormat(str) {
	return str.split(REGX);
}

/**
 * Create a map of each char to the format sections for ui clicks.
 * This allows the input to place a cursor on a section of the date.
 *
 * @private
 * @method createSectionMap
 * @param str {string} moment date format string
 * @return {object}  map[Map] and sections[] are returned in the object.
 */
function createSectionMap(str) {
	let split = splitFormat(str);
	let map = new window.Map();
	let sections = [];
	let start = 0,		// index for the start of a section
			end = 0,			// index for the end of a section
			index = 0;		// tracks the current section for indexing each char

	// loop over each char and assign it to the a section
	// for example:
	//    MM/DD/YYYY
	//    0001112222
	//
	// when the user clicks on the first `/` char the map will place the cursor
	// in the `0` indexed section or `MM` section type
	for(let i=0; i<str.length; i++) {
		end = start + split[index].length;
		map.set(i, index);
		if (REGX.test(str[i]) && !REGX.test(str[i+1])) {
			sections.push({ start, end });
			index += 1;
			start = i+1;
		}
	}

	sections.push({ start, end });
	return { map, sections };
}

/**
 * helper method to handle index changes to force key to remain in bounds
 *
 * ie. (key: 10, startBound: 0, endBound: 10) return endBound
 * or (key:-1, startBound: 0, endBound: 10) return startBound
 *
 * @private
 * @method normalizeIndex
 * @param key {number} the value to force within the bounds
 * @param startBound {number} min value ie. 0
 * @param endBound {number} max value ie. Array.length
 * @return {number}
 */
function normalizeIndex(key, startBound, endBound) {
	if (key < startBound) { // key is less than start so return start
		key = startBound;
	} else if (key > endBound) { // key is greater than end so return end
		key = endBound;
	}
	return key;
}

export function getCursorPosition(format, value, index, isAdd=false, isSub=false) {
	index = normalizeIndex(index, 0, value.length - 1);
	let { vmap } = findSectionIndex(format, value);
	let length = vmap.sections.length;
	let idx = vmap.map.get(index);

	if (isAdd) {
		idx = normalizeIndex(idx + 1, 0, length-1);
	} else if (isSub) {
		idx = normalizeIndex(idx - 1, 0, length-1);
	}
	return vmap.sections[idx];
}

export function getFormatSection(format, value, index) {
	index = normalizeIndex(index, 0, value.length - 1);
	let { vmap, fmap } = findSectionIndex(format, value);
	let idx = vmap.map.get(index);
	let fcur = fmap.sections[idx];

	return format.substring(fcur.start, fcur.end);
}

export function findSectionIndex(format, value) {
	let fmap = createSectionMap(format);
	let vmap = createSectionMap(value);

	return { fmap, vmap };
}
