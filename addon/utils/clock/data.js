/**
 * @module Utils/Clock
 *
 */
import { assert } from '@ember/debug';
import { isArray } from '@ember/array';
import { numberToString } from './string';
import { HOUR_FLAG, MINUTE_FLAG } from './base';
import _time from '../time';

const dataArray = Base => class extends Base {
	constructor(...args) {
		super(...args);

		const data = args[0];
		assert("data must be an array", isArray(data));
		this.__data = data;
	}

	objectAt(key) {
		return this.__data[key];
	}

	filterEach(prop, cb) {
		return this.__data.forEach((d, i) => {
			if (d[prop]) {
				cb(d, i);
			}
		});
	}

	each(cb) {
		return this.__data.forEach((d, i) => cb(d, i));
	}
}

export default dataArray;

export function createPoints(start, end, rounder, selectRounder) {
	if (selectRounder <= 0) {
		selectRounder = 1;
	}

	if (selectRounder > rounder) {
		rounder = selectRounder;
	}

	const points = [];
	let renderSize = 0;
	for (let num=start; num<=end; num++) {
		let isVisible = false;
		if ((num % rounder) === 0) {
			isVisible = true;
		}

		let isRender = false;
		if ((num % selectRounder) === 0) {
			isRender = true;
			renderSize += 1;
		}

		let value = numberToString(num);
		points.push({ num, value, isVisible, isRender });
	}
	return { points, renderSize };
}

export function getAttrs(el, attrs) {
	const __attrs = {};
	attrs.forEach(key => {
		__attrs[key] = el.attr(key);
	});
	return __attrs;
}

export function getDate(type, value, timestamp) {
	const time = _time(timestamp);
	if (type === HOUR_FLAG) {
		if (value === 12) {
			value = 0;
		}

		if (time.format('A') === 'PM') {
			value = value + 12;
		}

		time.hour(value);
	} else if (type === MINUTE_FLAG) {
		time.minute(value);
	} else {
		assert(`Invalid type [${type}] passed to getDate, valid types are ${HOUR_FLAG} and ${MINUTE_FLAG}`, false);
	}
	return time;
}

export function getHourMinute(type, timestamp, selectRounder) {
	if (type === HOUR_FLAG) {
		let hour = parseInt(_time(timestamp).format('H'), 10);
		if (hour <= 0) { hour = 12; }					// enforce hour is not set to 0
		if (hour > 12) { hour = hour - 12; }	// enforce hour is 12 hour format
		return hour;
	} else {
		let num = _time(timestamp).minute();
		let dist = num % selectRounder;
		let low = selectRounder - dist;
		if (low > dist) {
			num -= dist;
		} else {
			num += low;
		}
		return num;
	}
}

export function isInBounds(date, min, max) {
	return _time.isDateInBounds(date, min, max);
}
