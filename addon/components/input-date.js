/**
 * @module components
 *
 */
import { get, set } from '@ember/object';
import { isNone } from '@ember/utils';
import { on } from '@ember/object/evented';
import { later } from '@ember/runloop';
import TextField from "@ember/component/text-field"
import moment from 'moment';
import keyEvent from 'ember-paper-time-picker/utils/key-event';
import paperTime from 'ember-paper-time-picker/utils/paper-time';
import dateFormatParser from 'ember-paper-time-picker/utils/date-format-parser';

/***/

/**
 *
 */
export default TextField.extend({
	classNames: ['paper-date-input'],

	type: 'text',

	timestamp: null,
	min: null,
	max: null,

	format: 'MM/DD/YYYY',
	formatParser: null,
	localeData: null,

	lastCursorIndex: null,
	lastNumIndex: null,

	_date: null,
	value: null,

	setupComponent: on('willInsertElement', function() {
		let format = get(this, 'format');

		// set value
		let date;
		if (!isNone(get(this, 'timestamp'))) {
			date = paperTime(get(this, 'timestamp'));
		} else {
			date = paperTime();
		}
		set(this, 'value', date.format(format));
		set(this, '_date', date.milli());

		// store localeData
		const localeData = moment.localeData();
		set(this, 'localeData', localeData);

		// get locale converted format str
		let lFormat = localeData.longDateFormat(format);
		if (!isNone(lFormat)) {
			format = lFormat;
		}

		// create new format parser
		if (isNone(get(this, 'formatParser'))) {
			set(this, 'formatParser', dateFormatParser(format));
		}
	}),

	isValid(date) {
		if (date.moment.isValid()) {
			return this.isDateInBounds(date);
		}
		return false;
	},

	isDateInBounds(date) {
		const max = get(this, 'max');
		const min = get(this, 'min');
		if (isNone(max) && isNone(min)) {	// no min or max date
			return true;
		} else if (date.milli() >= min && isNone(max)) { // date is greater than min date and no max date
			return true;
		} else if (isNone(min) && date.milli() <= max) { // no min date and date is less than max date
			return true;
		} else if (date.milli() >= min && date.milli() <= max) { // date is greater than min date and date is less than max date
			return true;
		}
		return false;
	},

	submitChange(value) {
		if (this.isValid(value)) {
			set(this, '_date', value.milli());
			set(this, 'value', value.format(get(this, 'format')));
			this.sendAction('onchange', value.milli());
			return true;
		}
		return false;
	},

	getFormatSection() {
		let section = get(this, 'formatParser').getFormatSection(get(this, 'lastCursorIndex'));
		let { start, end } = get(this, 'formatParser').current(get(this, 'lastCursorIndex'));
		return { section, start, end };
	},

	_format() {
		return get(this, 'formatParser.format');
	},

	handleCursor(isNext=false, isPrev=false) {
		const parser = get(this, 'formatParser');
		const index = get(this, 'lastCursorIndex');

		let cursor;
		if (isNext) {
			cursor = parser.next(index);
		} else if (isPrev) {
			cursor = parser.prev(index);
		} else {
			cursor = parser.current(index);
		}

		later(() => {
			this.$().get(0).setSelectionRange(cursor.start, cursor.end);
			if (index !== cursor.start) {
				set(this, 'lastCursorIndex', cursor.start);
				set(this, 'lastNumIndex', 0);
			}
		}, 1);
	},

	forceValidTime(major, minor, lastMajor, max, index) {
		if (isNaN(minor)) {
			minor = major - 10;
			major = 0;
			lastMajor = 0;
		}

		let total = major + minor;
		if (total > max) {
			if (index === 0) {
				if (major < max) {
					total = major;
				} else if ((lastMajor+major) < max) {
					total = lastMajor + major;
				}
			}
		}
		return total
	},

	setDateForNumber(numberKey) {
		const value = get(this, 'value');
		const { section, start, end } = this.getFormatSection();
		const localeData = get(this, 'localeData');
		let date = paperTime(value, get(this, 'format'));
		let timeSinceLastKey = paperTime().unix() - get(this, '__numTimer');

		let lastNumIndex = get(this, 'lastNumIndex');
		if (lastNumIndex === section.length) {
			lastNumIndex = 0;
		} else if (timeSinceLastKey > 5) {
			lastNumIndex = 0;
		}

		let max;
		let min = 0;
		let hasOrd = false;
		if (/^D(o|D)?$/.test(section)) { // days of month
			max = date.moment.daysInMonth();
			hasOrd = section === 'Do';
		} else if (/^M(o|M)?$/.test(section)) { // months of year
			max = 12;
			hasOrd = section === 'Mo';
		} else if (/^Y{1,4}$/.test(section)) {
			max = isNone(get(this, 'max')) ? moment().add(100, 'years').year() : moment(get(this, 'max')).year();
			min = isNone(get(this, 'max')) ? moment().subtact(100, 'years').year() : moment(get(this, 'min')).year();
		}

		let dateSection = date.format(section);
		let shifted = recalcDate(section, dateSection, numberKey, lastNumIndex, min, max);
		//set(this, 'lastNumIndex', shifted.index);

		//console.log('newDateSection', shifted.value, dateSection, numberKey, lastNumIndex);
		//let shifted = shiftDate(dateSection, numberKey, lastNumIndex, min, max);
		//if (shifted.index !== -1) {
		//	set(this, 'lastNumIndex', shifted.index);
		//}

		set(this, '__numTimer', paperTime().unix());

		//let newDateSection = hasOrd ? localeData.ordinal(parseInt(shifted.str, 10)) : shifted.str;
		let newDateSection = hasOrd ? localeData.ordinal(parseInt(shifted.value, 10)) : shifted.value;
		let nd = mergeString(value, newDateSection, start, end);
		return paperTime(nd, get(this, 'format'));
	},

	handleNumberKeys(event, handler) {
		const date = this.setDateForNumber(handler.keyName);
		let index = get(this, 'lastNumIndex');
		if (!this.submitChange(date)) {
			index = index > 0 ? index-1 : 0;
		} else {
			index = index + 1;
		}
		set(this, 'lastNumIndex', index);

		this.handleCursor();
		return handler.preventDefault();
	},

	handleArrowKeys(event, handler) {
		if (handler.keyName === 'left-arrow') {
			this.handleCursor(false, true);
		} else if (handler.keyName === 'right-arrow') {
			this.handleCursor(true, false);
		} else {
			let { section } = this.getFormatSection();
			let value = get(this, '_date');

			let val;
			if (handler.keyName === 'up-arrow') {
				val = paperTime(value).addFormatted(1, section);
			} else {
				val = paperTime(value).subFormatted(1, section);
			}
			this.submitChange(val);
			this.handleCursor();
		}
		return handler.preventDefault();
	},

	focusInEvent: on('focusIn', function(event) {
		if (isNone(get(this, 'lastCursorIndex'))) {
			// find the index for the start of the day format string
			let index = this._format().search(/(d|D)/);
			set(this, 'lastCursorIndex', index);
			set(this, 'lastNumIndex', 0);
		}
		this.handleCursor();
		this.sendAction('onfocus', event);
	}),

	clickEvent: on('click', function(event) {
		this.sendAction('onclick', event);
	}),

	keyDown: function(event) {
		let handler = keyEvent({ event, allowed: ['tab', 'left-arrow', 'right-arrow', 'up-arrow', 'down-arrow', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
		if (handler.allowed) {
			if (!handler.throttle) {
				if (/arrow/.test(handler.keyName)) {
					return this.handleArrowKeys(event, handler);
				} else if (/^[0-9]$/.test(handler.keyName)) {
					return this.handleNumberKeys(event, handler);
				} else if (handler.keyName === 'tab') {
					this.sendAction('ontabkey', event);
				}
			}
			return handler.preventDefault();
		}
	}
});

function recalcDate(format, str, key, index, min, max) {
	let value = key;
	if (index === 0) {
		value = getFromMinValueString(format, key, min);
		index += 1;
	} else {
		value = (str + key).substr(1);
		index += 1;

		if (parseInt(value, 10) > max) {
			value = getFromMinValueString(format, key, min);
			index = 0;
		}
	}
	return { value, index };
}

function mergeString(str, insert, start, end) {
	return str.substr(0, start) + insert + str.substr(end);
}

function getFromMinValueString(str, key, min) {
	let template = `000000000`.slice(0, str.length);
	let minVal = mergeString(template, `${min}`, template.length - `${min}`.length, template.length);
	let value = minVal.substr(0, minVal.length-1) + key;
	if (parseInt(value, 10) < min) {
		return getFromMinValueString(str, key + '0', min);
	}
	return value;
}

//function shiftDate(str, key, index, min, max, zeroFill=true) {
//	if (index > str.length-1) {
//		return { str: date, index: -1 };
//	}
//
//	let date = mergeString(str, key, index, index+1);
//	if (parseInt(date, 10) > max) {
//		let shifted = shiftDate(str, key, index+1, min, max);
//		if (shifted.str === date && index === 0 && zeroFill) {
//			let template = `000000000`.slice(0, str.length);
//			let minDate = mergeString(template, `${min}`, template.length - `${min}`.length, template.length);
//			return shiftDate(minDate, key, index+1, min, max, false);
//		}
//		return shifted;
//	}
//
//	index = (index >= str.length-1) ? 0 : index + 1;
//	return { str: date, index };
//}

