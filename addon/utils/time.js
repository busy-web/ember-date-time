/**
 * @module Utils/Time
 *
 */
import moment from 'moment';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import {
	YEAR_FLAG,
	MONTH_FLAG,
	WEEKDAY_FLAG,
	DAY_FLAG,
	HOUR_FLAG,
	MINUTE_FLAG,
	MERIDIAN_FLAG
} from '@busy-web/ember-date-time/utils/constant';

/**
 * Time utils for working with dates that will not
 * convert using timezones. Dates will remain the same
 * for input and output
 *
 * @class Time
 */
class Time extends moment.fn.constructor {
	constructor(...args) {
		super(...args);
	}

	timestamp() {
		return this.valueOf();
	}

	addFormatted(value, format) {
		let type = convertType(format);
		if (type) {
			if (type === 'ampm') {
				type = 'h';
				value = value * 12;
			}
			this.add(value, type);
		} else {
			throw new Error('Format not found for ' + type);
		}
		return this;
	}

	subFormatted(value, format) {
		let type = convertType(format);
		if (type) {
			if (type === 'ampm') {
				type = 'h';
				value = value * 12;
			}
			this.subtract(value, type);
		} else {
			throw new Error('Format not found for ' + type);
		}
		return this;
	}
}

function _time(...args) {
	const m = moment.apply(this, args);
	return new Time(m);
}
_time.unix = time => new Time(moment.unix(time));
_time.utc = time => new Time(moment.utc(time));
_time.localeData = () => moment.localeData();
_time.locale = () => moment.locale();
_time.duration = (time, type) => moment.duration(time, type);

_time.daysApart = (start, end) => Math.floor(moment.duration(end - start, 'ms').asDays());
_time.hoursApart = (start, end) => Math.floor(moment.duration(end - start, 'ms').asHours());

_time.utcToLocal = function(time) {
	const m = moment.utc(time)
		.subtract(moment.utc(time).local().utcOffset(), 'minutes');
	return new Time(m);
};

_time.utcFromLocal = function(time) {
	const m = moment(time)
		.add(moment(time).utcOffset(), 'minutes');
	return new Time(m);
};

_time.round = function(time, round=1) {
	let date = moment(time);
	let minute = date.minute();
	let dist = minute % round;
	let low = round - dist;
	if (low > dist) {
		minute -= dist;
	} else {
		minute += low;
	}
	date.minute(minute).seconds(0);
	return date.valueOf();
};

_time.standardFormatTypes = function() {
	return {
		YYYY: /Y{1,4}/,
		MM: /M(o|M)?/,
		DD: /D(o|D)?/,
		HH: /(HH?|hh?)/,
		mm: /mm?/,
		ss: /ss?/
	};
};

_time.formatStringType = function(fmt) {
	if (/^D(o|D)?$/.test(fmt)) {
		return DAY_FLAG;
	} else if (/^d(o|d|dd|ddd)?$/.test(fmt)) {
		return WEEKDAY_FLAG;
	} else if (/^M(o|M|MM|MMM)?$/.test(fmt)) {
		return MONTH_FLAG;
	} else if (/^Y{1,4}$/.test(fmt)) {
		return YEAR_FLAG;
	} else if (/^hh?$/.test(fmt)) {
		return HOUR_FLAG;
	} else if (/^HH?$/.test(fmt)) {
		return 'm-hours';
	} else if (/^mm?$/.test(fmt)) {
		return MINUTE_FLAG;
	} else if (/^ss?$/.test(fmt)) {
		return 'seconds';
	} else if (/^A|a$/.test(fmt)) {
		return MERIDIAN_FLAG;
	} else {
		return null;
	}
};

_time.typeExp = function(type) {
	if (type === DAY_FLAG) {
		return /D(o|D)?/;
	} else if (type === WEEKDAY_FLAG) {
		return /d(o|d|dd|ddd)?/;
	} else if (type === MONTH_FLAG) {
		return /M(o|M|MM|MMM)?/;
	} else if (type === YEAR_FLAG) {
		return /Y{1,4}/;
	} else if (type === HOUR_FLAG) {
		return /hh?/;
	} else if (type === 'm-hours') {
		return /HH?/;
	} else if (type === MINUTE_FLAG) {
		return /mm?/;
	} else if (type === 'seconds') {
		return /ss?/;
	} else if (type === MERIDIAN_FLAG) {
		return /A|a/;
	}
};

/**
	* validates a moment date object
	*
	* @public
	* @method isValidDate
	* @param date {Moment}
	* @return {boolean}
	*/
_time.isValidDate = function(date) {
	return !isNone(date) && typeof date === 'object' && moment.isMoment(date) && date.isValid();
};

/**
	* validates a timestamp or unix timestamp
	*
	* @public
	* @method isValidTimestamp
	* @param timestamp {number}
	* @return {boolean}
	*/
_time.isValidTimestamp = function(timestamp) {
	let isValid = false;
	if (typeof timestamp === 'number' && !isNaN(timestamp)) {
		const date = _time(timestamp);
		isValid = _time.isValidDate(date);
	}
	return isValid;
};

_time.isDateBefore = function(date, minDate) {
	let isBefore = false;
	if (!isNone(minDate)) {
		if (typeof minDate === 'number' && !isNaN(minDate)) {
			minDate = _time(minDate);
		}

		if (typeof date === 'number' && !isNaN(date)) {
			date = _time(date);
		}

		if (typeof minDate === 'object' && _time.isValidDate(minDate)) {
			isBefore = date.isBefore(minDate);
		} else {
			assert('Invalid minDate passed to isDateInBounds');
		}
	}
	return isBefore;
};

_time.isDateAfter = function(date, maxDate) {
	let isAfter = false;
	if (!isNone(maxDate)) {
		if (typeof maxDate === 'number' && !isNaN(maxDate)) {
			maxDate = _time(maxDate);
		}

		if (typeof date === 'number' && !isNaN(date)) {
			date = _time(date);
		}

		if (typeof maxDate === 'object' && _time.isValidDate(maxDate)) {
			isAfter = date.isAfter(maxDate);
		} else {
			assert('Invalid maxDate passed to isDateInBounds');
		}
	}
	return isAfter;
};

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
_time.isDateInBounds = function(date, minDate, maxDate) {
	const isBefore = _time.isDateBefore(date, minDate);
	const isAfter = _time.isDateAfter(date, maxDate);

	return { isBefore, isAfter };
};

function convertType(type) {
	let map = {
		'^(Y{1,4}|(gg){1,2}|(GG){1,2})$': 'y',
		'^M(o?|M{0,3})$': 'M',
		'^W(o|W)?$': 'w',
		'^Qo?$': 'Q',
		'^w(o|w)?$': 'w',
		'^D(o|DDo?|DD?D?)?$': 'd',
		'^d(o?|d{0,3})$': 'd',
		'^(HH?|hh?)$': 'h',
		'^mm?$': 'm',
		'^ss?$': 's',
		'^(A|a)$': 'ampm'
	};

	let res;
	Object.keys(map).forEach(key => {
		if (res === undefined) {
			let reg = new RegExp(key);
			if (reg.test(type)) {
				res = map[key];
			}
		}
	});
	return res;
}

export default _time;

const LOCALE_DATA = {
	"en": {
		this_day: 'Today',
		next_day: 'Tomorrow',
		last_day: 'Yesterday',
		this_week: 'This Week',
		next_week: 'Next Week',
		last_week: 'Last Week',
		this_month: 'This Month',
		next_month: 'Next Month',
		last_month: 'Last Month'
	},
	"en-us": {
		this_day: 'Today',
		next_day: 'Tomorrow',
		last_day: 'Yesterday',
		this_week: 'This Week',
		next_week: 'Next Week',
		last_week: 'Last Week',
		this_month: 'This Month',
		next_month: 'Next Month',
		last_month: 'Last Month'
	},
	"es": {
		this_day: 'Hoy',
		next_day: 'Mañana',
		last_day: 'Ayer',
		this_week: 'Esta Semana',
		next_week: 'La Próxima Semana',
		last_week: 'La Semana Pasada',
		this_month: 'Este Mes',
		next_month: 'Próximo Mes',
		last_month: 'El Mes Pasado'
	}
};

export function i18n(key) {
	return LOCALE_DATA[_time.locale()][key];
}
