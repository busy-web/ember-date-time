/**
 * @module components
 *
 */
import { Promise as EmberPromise, resolve } from 'rsvp';
import { observer, computed, get, set } from '@ember/object';
import { isNone } from '@ember/utils';
import { on } from '@ember/object/evented';
import { run, later } from '@ember/runloop';
import { assert } from '@ember/debug';
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
	classNameBindings: ['isDateInRange::invalid', 'active'],

	type: 'text',

	timestamp: null,
	min: null,
	max: null,

	format: 'MM/DD/YYYY',
	__formatParser: null,
	__localeData: null,

	__lastCursorIndex: null,
	__lastNumIndex: null,

	_date: null,
	value: null,
	active: false,

	isDateInRange: computed('value', '__lastNumIndex', function() {
		// when value is null or lastNumIndex is null or lastNumIndex is not 0 then it is in a temp state when invalid is ignored
		if (isNone(get(this, 'value')) || isNone(get(this, '__lastNumIndex')) || get(this, '__lastNumIndex') !== 0) {
			return true;
		}

		// get the current value as a date object
		let date = paperTime(get(this, 'value'), get(this, 'format'));

		// date must be valid and within range to be a valid date range
		if (date.moment.isValid() && this.isDateInBounds(date)) {
			return true;
		}
		return false;
	}),

	setupComponent: on('willInsertElement', function() {
		let format = get(this, 'format');

		assert('Format not supported. Please use a format with only `MM/DD/YYYY` or `L` for localized formats. Delimiter values can be `-/.,|`', !/(Do|Mo|MMM|DDD|[khHmsSAaGgWwEeQ])/.test(format));

		this.timestampChange();

		// store localeData
		const localeData = moment.localeData();
		set(this, 'localeData', localeData);

		// get locale converted format str
		let lFormat = localeData.longDateFormat(format);
		if (!isNone(lFormat)) {
			format = lFormat;
		}

		// create new format parser
		if (isNone(get(this, '__formatParser'))) {
			set(this, '__formatParser', dateFormatParser(format));
		}
	}),

	timestampChange: observer('timestamp', function() {
		let date;
		if (!isNone(get(this, 'timestamp'))) {
			date = paperTime(get(this, 'timestamp'));
		} else {
			date = paperTime();
		}
		let format = get(this, 'format');
		set(this, 'value', date.format(format));
		set(this, '_date', date.milli());
	}),

	isValid(date) {
		if (date.moment.isValid()) {
			//return this.isDateInBounds(date);
			return true;
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
			//set(this, 'value', value.format(get(this, 'format')));
			this.sendAction('onchange', value.milli());
			return true;
		}
		return false;
	},

	finalizeDateSection() {
		let date = paperTime(get(this, 'value'), get(this, 'format'));
		if (date.moment.isValid()) {
			this.submitChange(date);
			set(this, '__lastNumIndex', 0);
			return true;
		}
		return false;
	},

	setDateSection(valueSection, index) {
		const value = get(this, 'value');
		const { sectionFormat, start } = sectionMeta(this);
		const end = start + valueSection.length;

		// merge the date string section into the current date string
		let newVal = mergeString(value, valueSection, start, end);

		set(this, 'value', newVal);

		// set new number index and handle cursor selection
		if (index >= sectionFormat.length) {
			// create a new date object
			if (this.finalizeDateSection()) {
				moveToNextPosition(this);
			} else {
				set(this, '__lastNumIndex', 0);
				setSelected(this, start-1, end+1);
				later(() => setSelected(this, start, end), 100);
			}
		} else {
			set(this, '__lastNumIndex', index);
			setSelected(this, start, end);
		}
	},

	handleNumberKeys(event, handler) {
		let { value, end } = sectionMeta(this);
		let { max } = sectionBounds(this);
		let index = get(this, '__lastNumIndex');
		let valueSection = createSection(this, handler.keyName, index);
		index = index + 1;

		if(end !== value.length && parseInt(valueSection, 10) > max) {
			moveToNextPosition(this).then(() => false).then(() => {
				this.handleNumberKeys(event, handler);
			});
		} else {
			this.setDateSection(valueSection, index);
		}

		return handler.preventDefault();
	},

	handlerDeleteKey(event, handler) {
		let { value } = sectionMeta(this);
		let index = get(this, '__lastNumIndex');
		index = index - 1;

		if (index >= 0) {
			let valueSection = createSection(value, 0, index-1);
			this.setDateSection(valueSection, index);
		}

		return handler.preventDefault();
	},

	handleArrowKeys(event, handler) {
		if (handler.keyName === 'left-arrow') {
			handleCursor(this, -1);
		} else if (handler.keyName === 'right-arrow') {
			handleCursor(this, 1);
		} else {
			let { sectionFormat } = sectionMeta(this);
			let value = get(this, '_date');

			let val;
			if (handler.keyName === 'up-arrow') {
				val = paperTime(value).addFormatted(1, sectionFormat);
			} else {
				val = paperTime(value).subFormatted(1, sectionFormat);
			}

			set(this, 'value', val.format(get(this, 'format')));
			handleCursor(this, 0);
		}

		this.finalizeDateSection();
		return handler.preventDefault();
	},

	handleFocus(index) {
		// set cursor index and last num index
		set(this, '__lastCursorIndex', index);
		set(this, '__lastNumIndex', 0);

		handleCursor(this, 0);
		this.set('active', true);
	},

	focusInEvent: on('focusIn', function(event) {
		this.handleFocus(0);
		this.sendAction('onfocus', event);
	}),

	focusOutEvent: on('focusOut', function(event) {
		this.set('active', false);
		this.sendAction('onblur', event);
	}),

	clickEvent: on('click', function(event) {
		let index = event.target.selectionStart;
		this.handleFocus(index);
		this.sendAction('onclick', event);
	}),

	keyDown: function(event) {
		let handler = keyEvent({ event, disable: ['letters'] }); //'tab', 'delete', 'enter', 'left-arrow', 'right-arrow', 'up-arrow', 'down-arrow', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
		if (handler.allowed) {
			if (!handler.throttle) {
				if (/arrow/.test(handler.keyName)) {
					return this.handleArrowKeys(event, handler);
				} else if (/^[0-9]$/.test(handler.keyName)) {
					return this.handleNumberKeys(event, handler);
				} else if (handler.keyName === 'delete') {
					return this.handlerDeleteKey(event, handler);
				} else if (handler.keyName === 'tab' || handler.keyName === 'enter') {
					this.sendAction('ontabkey', event);
				}
			}
		}
		return handler.preventDefault();
	}
});

//function recalcDate(format, str, key, index, min, max) {
//	let value = (str + key).substr(1);
//	if (index === 0) { // || parseInt(value, 10) > max || parseInt(value, 10) < min) {
//		value = getFromMinValueString(format, key, 0);
//		//index = 0;
//	}
//
//	index = index+1;
//	return { value, index };
//}

function sectionMeta(target) {
	let value = get(target, 'value');
	let sectionFormat = get(target, '__formatParser').getFormatSection(get(target, '__lastCursorIndex'));
	let { start, end } = get(target, '__formatParser').current(get(target, '__lastCursorIndex'));
	return { value, sectionFormat, start, end };
}

function sectionBounds(target) {
	const format = get(target, '__formatParser.format');
	let max;
	let min = 0;
	if (/^D(o|D)?$/.test(format)) { // days of month
		const date = paperTime(get(target, '_date'));
		max = date.moment.daysInMonth();
	} else if (/^M(o|M)?$/.test(format)) { // months of year
		max = 12;
	} else if (/^Y{1,4}$/.test(format)) {
		max = isNone(get(target, 'max')) ? moment().add(100, 'years').year() : moment(get(target, 'max')).year();
		//min = isNone(get(target, 'max')) ? moment().subtact(100, 'years').year() : moment(get(target, 'min')).year();
	}
	return { min, max }
}

function setSelected(target, start, end) {
	return new EmberPromise(resolve => {
		later(() => {
			const index = get(target, '__lastCursorIndex');
			target.$().get(0).setSelectionRange(start, end);
			if (index !== start) {
				set(target, '__lastCursorIndex', start);
			}
			run(null, resolve, null);
		}, 10);
	});
}

function handleCursor(target, action=0) {
	const parser = get(target, '__formatParser');
	const index = get(target, '__lastCursorIndex');

	let cursor;
	if (action === 1) {
		cursor = parser.next(index);
	} else if (action === -1) {
		cursor = parser.prev(index);
	} else {
		cursor = parser.current(index);
	}
	return setSelected(target, cursor.start, cursor.end);
}

function moveToNextPosition(target) {
	const { end } = sectionMeta(target);
	const format = get(target, '__formatParser.format');

	set(target, '__lastNumIndex', 0);
	if (end === format.length) {
		target.sendAction('ontabkey', target.$());
		return resolve();
	} else {
		return handleCursor(target, 1);
	}
}

function createSection(target, num, index) {
	const { value, sectionFormat, start, end } = sectionMeta(target);
	const substr = value.substring(start, end);

	// calculate new date from input
	let ds = shiftString(substr, num);
	if (index === 0) { // || parseInt(value, 10) > max || parseInt(value, 10) < min) {
		let template = `000000000`.slice(0, sectionFormat.length);
		ds = shiftString(template, num);
	}
	return ds;
}

function shiftString(str, val) {
	return (str + val).substr(1)
}

function mergeString(str, insert, start, end) {
	return str.substr(0, start) + insert + str.substr(end);
}

//function getFromMinValueString(str, key, min) {
//	if (key.length > str.length) {
//		return str;
//	}
//
//	let template = `000000000`.slice(0, str.length);
//	let minVal = mergeString(template, `${min}`, template.length - `${min}`.length, template.length);
//	let value = minVal.substr(0, minVal.length-key.length) + key;
//	if (parseInt(value, 10) < min) {
//		return getFromMinValueString(str, key + '0', min);
//	}
//	return value;
//}
//
