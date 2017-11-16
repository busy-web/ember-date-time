/**
 * @module Utils
 *
 */
import EmberObject, { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';

/**
 * Create a new date format parser
 *
 * @public
 * @method dateFormatParser
 * @params format {string} a moment() date format string
 * @return {DateFormatParser}
 */
export default function dateFormatParser(format) {
	assert('dateFormatParser expects a date format string passed in', !isEmpty(format) && typeof format === 'string');

	const reg = new RegExp(/\/|\.|-|,|]/);
	let split = format.split(reg);
	let end = 0;
	let sections = [];
	split.forEach(p => {
		let start = end;
		end += p.length;
		sections.push({ start, end });
		end += 1;
	});

	let index = 0;
	let map = new window.Map();
	for(let i=0; i<format.length; i++) {
		if (reg.test(format[i])) {
			map.set(i, index);
			index += 1;
		} else {
			map.set(i, index);
		}
	}
	return DateFormatParser.create({ format, map, sections });
}

/**
 * helper method to handle index changes to force key to remain in bounds
 *
 * ie. (key: 10, startBound: 0, endBound: 10) return endBound
 * or (key:-1, startBound: 0, endBound: 10) return startBound
 *
 * @private
 * @method normalizeIndex
 * @params key {number} the value to force within the bounds
 * @params startBound {number} min value ie. 0
 * @params endBound {number} max value ie. Array.length
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

const DateFormatParser = EmberObject.extend({
	/**
	 * the date format string
	 *
	 * @property format
	 * @type {string}
	 */
	format: '',

	/**
	 * Map for all indexes of `format` that point to a section of the format
	 * ie. 'YY/DD' => 0 === 0 (YY), 1 === 0 (YY), 2 === 1 (DD), 3 === 1 (DD)
	 *
	 * @property map
	 * @type {Map}
	 */
	map: null,

	/**
	 * array for all sections of `format`
	 * ie. 'YY/DD' has 2 sections YY, DD
	 *
	 * @property sections
	 * @type {Array}
	 */
	sections: null,

	next(index) {
		return this._getter(index, true, false);
	},

	prev(index) {
		return this._getter(index, false, true);
	},

	current(index) {
		return this._getter(index, false, false);
	},

	getFormatSection(index) {
		let { start, end } = this.current(index);
		return get(this, 'format').substring(start, end);
	},

	_getter(index, isAdd=false, isSubtract=false) {
		index = normalizeIndex(index, 0, get(this, 'format.length') - 1);
		const map = get(this, 'map');
		const sections = get(this, 'sections');

		let mIndex = map.get(index);
		if (isAdd) {
			mIndex = normalizeIndex(mIndex + 1, 0, sections.length-1);
		} else if (isSubtract) {
			mIndex = normalizeIndex(mIndex - 1, 0, sections.length-1);
		}
		return sections[mIndex];
	}
});

