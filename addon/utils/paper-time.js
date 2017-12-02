/**
 * @module Utils/Time
 *
 */
import moment from 'moment';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';

/**
 * Time utils for working with dates that will not
 * convert using timezones. Dates will remain the same
 * for input and output
 *
 * @class PaperTime
 */
class PaperTime extends moment.fn.constructor {
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

function paperTime(...args) {
	const m = moment.apply(this, args);
	return new PaperTime(m);
}
paperTime.unix = time => new PaperTime(moment.unix(time));
paperTime.utc = time => new PaperTime(moment.utc(time));
paperTime.localeData = () => moment.localeData();
paperTime.duration = (time, type) => moment.duration(time, type);

paperTime.daysApart = (start, end) => Math.floor(moment.duration(end - start, 'ms').asDays());
paperTime.hoursApart = (start, end) => Math.floor(moment.duration(end - start, 'ms').asHours());

paperTime.utcToLocal = function(time) {
	const m = moment.utc(time)
		.subtract(moment.utc(time).local().utcOffset(), 'minutes');
	return new PaperTime(m);
};

paperTime.utcFromLocal = function(time) {
	const m = moment(time)
		.add(moment(time).utcOffset(), 'minutes');
	return new PaperTime(m);
};

paperTime.formatStringType = function(fmt) {
	if (/^D(o|D)?$/.test(fmt)) {
		return 'days';
	} else if (/^M(o|M)?$/.test(fmt)) {
		return 'months';
	} else if (/^Y{1,4}$/.test(fmt)) {
		return 'years';
	} else if (/^hh?$/.test(fmt)) {
		return 'hours';
	} else if (/^HH?$/.test(fmt)) {
		return 'm-hours';
	} else if (/^mm?$/.test(fmt)) {
		return 'minutes';
	} else if (/^ss?$/.test(fmt)) {
		return 'seconds';
	} else if (/^A|a$/.test(fmt)) {
		return 'meridian';
	}
};

paperTime.typeExp = function(type) {
	if (type === 'days') {
		return /D(o|D)?/;
	} else if (type === 'months') {
		return /M(o|M)?/;
	} else if (type === 'years') {
		return /Y{1,4}/;
	} else if (type === 'hours') {
		return /hh?/;
	} else if (type === 'm-hours') {
		return /HH?/;
	} else if (type === 'minutes') {
		return /mm?/;
	} else if (type === 'seconds') {
		return /ss?/;
	} else if (type === 'meridian') {
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
paperTime.isValidDate = function(date) {
	return !isNone(date) && typeof date === 'object' && moment.isMoment(date) && date.isValid();
};

paperTime.isDateBefore = function(date, minDate) {
	let isBefore = false;
	if (!isNone(minDate)) {
		if (typeof minDate === 'number' && !isNaN(minDate)) {
			minDate = paperTime(minDate);
		}

		if (typeof minDate === 'object' && paperTime.isValidDate(minDate)) {
			isBefore = date.isBefore(minDate);
		} else {
			assert('Invalid minDate passed to isDateInBounds');
		}
	}
	return isBefore;
};

paperTime.isDateAfter = function(date, maxDate) {
	let isAfter = false;
	if (!isNone(maxDate)) {
		if (typeof maxDate === 'number' && !isNaN(maxDate)) {
			maxDate = paperTime(maxDate);
		}

		if (typeof maxDate === 'object' && paperTime.isValidDate(maxDate)) {
			isAfter = date.isAfter(maxDate);
		} else {
			assert('Invalid maxDate passed to isDateInBounds');
		}
	}
	return isAfter;
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

export default paperTime;
