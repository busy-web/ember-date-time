/**
 * @module Utils/Time
 *
 */
import moment from 'moment';

/**
 * Time utils for working with dates that will not
 * convert using timezones. Dates will remain the same
 * for input and output
 *
 * @class PaperTime
 */
class PaperTime {
	constructor(...args) {
		const date = moment(...args);
		const test = moment();

		if (test.unix() === date.unix()) {
			this.__offset = date.utcOffset();
			this.__date = moment(date.add(this.__offset, 'minutes').valueOf());
		} else {
			this.__date = moment(date.valueOf());
		}
	}

	get moment() {
		return this.__date;
	}

	milli() {
		return this.__date.valueOf()
	}

	unix() {
		return this.__date.unix();
	}

	valueOf() {
		return this.unix();
	}

	toString() {
		return this.__date.format();
	}

	format(f) {
		return this.__date.format(f);
	}

	addFormatted(value, format) {
		let type = convertType(format);
		if (type) {
			if (type === 'ampm') {
				type = 'h';
				value = value * 12;
			}
			this.__date.add(value, type);
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
			this.__date.subtract(value, type);
		} else {
			throw new Error('Format not found for ' + type);
		}
		return this;
	}
}

export default function paperTime(...args) {
	return new PaperTime(...args);
}


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
