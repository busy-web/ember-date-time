/**
 * @module Utils
 *
 */
import { isEmpty } from '@ember/utils';
import moment from 'moment';

const REGX = new RegExp(/\/|\.|-|,|]| |\[|:/);

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

export function splitFormat(str) {
	return str.split(REGX);
}

function createSectionMap(str) {
	let split = splitFormat(str);
	let map = new window.Map();
	let sections = [];
	let start = 0, end = 0, index = 0;
	for(let i=0; i<str.length; i++) {
		end = start + split[index].length;
		map.set(i, index);
		if (REGX.test(str[i])) {
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
