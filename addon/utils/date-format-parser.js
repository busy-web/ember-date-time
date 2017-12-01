/**
 * @module Utils
 *
 */
import EmberObject, { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';
import moment from 'moment';

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
 * Create a new date format parser
 *
 * @public
 * @method dateFormatParser
 * @params format {string} a moment() date format string
 * @return {DateFormatParser}
 */
export function dateFormatParser(format) {
	assert('dateFormatParser expects a date format string passed in', !isEmpty(format) && typeof format === 'string');
	const { map, sections } = createSectionMap(format);
	return DateFormatParser.create({ format, map, sections });
}

function createSectionMap(str) {
	const reg = new RegExp(/\/|\.|-|,|]| |\[|:/);
	let split = str.split(reg);

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
	for(let i=0; i<str.length; i++) {
		if (reg.test(str[i])) {
			map.set(i, index);
			index += 1;
		} else {
			map.set(i, index);
		}
	}
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

	next(index, value) {
		return this._getter(index, value, true, false);
	},

	prev(index, value) {
		return this._getter(index, value, false, true);
	},

	current(index, value) {
		return this._getter(index, value, false, false);
	},

	getFormatSection(index) {
		let { start, end } = this.current(index);
		return get(this, 'format').substring(start, end);
	},

	_getter(index, value, isAdd=false, isSubtract=false) {
		index = normalizeIndex(index, 0, get(this, 'format.length') - 1);
		let map = get(this, 'map');
		let sections = get(this, 'sections');
		if (!isEmpty(value)) {
			let valueMap = createSectionMap(value);
			map = valueMap.map;
			sections = valueMap.sections;
		}

		let mIndex = map.get(index);
		if (isAdd) {
			mIndex = normalizeIndex(mIndex + 1, 0, sections.length-1);
		} else if (isSubtract) {
			mIndex = normalizeIndex(mIndex - 1, 0, sections.length-1);
		}
		return sections[mIndex];
	}
});

