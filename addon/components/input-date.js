/**
 * @module components
 *
 */
import $ from 'jquery';
import { Promise as EmberPromise, resolve } from 'rsvp';
import { observer, computed, get, set } from '@ember/object';
import { isNone, isEmpty } from '@ember/utils';
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
	//attributeBindings: ['dataName:data-name', 'dataSelection:data-selection', 'dataPosition:data-position'],

	type: 'text',

	timestamp: null,
	min: null,
	max: null,

	format: 'MM/DD/YYYY',
	__localeData: null,

	_date: null,
	value: null,
	active: false,

	name: null,
	selection: 0,
	position: 0,

	isDateInRange: computed('value', function() {
		const { position } = getMeta(this);
		const value = get(this, 'value');

		// when value is null or lastNumIndex is null or lastNumIndex is not 0 then it is in a temp state when invalid is ignored
		if (isNone(value) || isNone(position) || position !== 0) {
			return true;
		}

		// get the current value as a date object
		const date = paperTime(value, get(this, 'format'));

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
		const lFormat = localeData.longDateFormat(format);
		if (!isNone(lFormat)) {
			format = lFormat;
		}

		setData(this, 'format', format);
		setData(this, 'selection', 0);
		setData(this, 'position', 0);
		setData(this, 'linked', null);

		// create new format parser
		if (isNone(getData(this, 'parser', null))) {
			setData(this, 'parser', dateFormatParser(format));
		}

		set(this, 'keyboard', getKeyboardStyle());
	}),

	timestampChange: observer('timestamp', function() {
		let date;
		if (!isNone(get(this, 'timestamp'))) {
			date = paperTime(get(this, 'timestamp'));
		} else {
			date = paperTime();
		}
		this.setValue(date.format(get(this, 'format')));
		set(this, '_date', date.milli());
	}),

	setValue(value) {
		set(this, 'value', value);
		//setData(this, 'value', value);
	},

	isValid(date) {
		if (date.moment.isValid()) {
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
			let val = value.milli();
			set(this, '_date', val);
			this.sendAction('onchange', val);
			return true;
		}
		return false;
	},

	finalizeDateSection() {
		let date = paperTime(get(this, 'value'), get(this, 'format'));
		if (date.moment.isValid()) {
			this.submitChange(date);
			setData(this, 'position', 0);
			return true;
		}
		return false;
	},

	fixDate() {
		const value = get(this, 'value');
		let { start, end } = getMeta(this);
		let { min, max } = sectionBounds(this);
		let valueSection = value.substring(start, end);

		if (parseInt(valueSection, 10) < min) {
			valueSection = ('0000000' + min).substr(-(valueSection.length));
		} else if (parseInt(valueSection, 10) > max) {
			valueSection = '' + max;
		}
		let newVal = mergeString(value, valueSection, start, end);
		this.setValue(newVal);
	},

	setDateSection(valueSection, position) {
		const value = get(this, 'value');
		let { sectionFormat, start, end } = getMeta(this);

		// merge the date string section into the current date string
		let newVal = mergeString(value, valueSection, start, end);

		this.setValue(newVal);

		// set new number position and handle cursor selection
		if (position >= sectionFormat.length) {
			// create a new date object
			this.fixDate();
			this.finalizeDateSection();
			later(() => moveToNextPosition(this), 1);
		} else {
			setData(this, 'position', position);
			setSelected(this, start, end);
		}
	},

	handleNumberKeys(event, handler) {
		const value = get(this, 'value');
		let { end, position } = getMeta(this);
		let { max } = sectionBounds(this);
		let valueSection = createSection(this, handler.keyName, position, false);
		position = position + 1;

		if(end !== value.length && parseInt(valueSection, 10) > max) {
			moveToNextPosition(this).then(result => {
				if (result.isNewInput) {
					let e = $.Event( 'keydown', { which: event.which } );
					result.input.trigger('keydown', e);
				} else {
					this.handleNumberKeys(event, handler);
				}
			});
		} else {
			this.setDateSection(valueSection, position);
		}
		return handler.preventDefault();
	},

	handleDeleteKey(event, handler) {
		let { position } = getMeta(this);
		if (position > 0) {
			let valueSection = createSection(this, 0, position, true);
			position = position - 1;
			this.setDateSection(valueSection, position);
		} else {
			moveToPrevPosition(this).then(result => {
				if (result.isNewInput) {
					let e = $.Event( 'keydown', { which: event.which } );
					result.input.trigger(e);
				} else {
					this.handleDeleteKey(event, handler);
				}
			});
		}
		return handler.preventDefault();
	},

	handleArrowKeys(event, handler) {
		if (handler.keyName === 'left-arrow') {
			handleCursor(this, 'prev');
		} else if (handler.keyName === 'right-arrow') {
			handleCursor(this, 'next');
		} else {
			const { sectionFormat } = getMeta(this);
			const _date = get(this, '_date');

			let val;
			if (handler.keyName === 'up-arrow') {
				val = paperTime(_date).addFormatted(1, sectionFormat);
			} else {
				val = paperTime(_date).subFormatted(1, sectionFormat);
			}

			this.setValue(val.format(get(this, 'format')));
			handleCursor(this, '');
		}

		this.finalizeDateSection();
		return handler.preventDefault();
	},

	focusInEvent: on('focusIn', function(event) {
		let { selection, position } = getMeta($(event.target));
		handleFocus(this, selection, position);
		this.sendAction('onfocus', event);
	}),

	focusOutEvent: on('focusOut', function(event) {
		this.set('active', false);
		this.sendAction('onblur', event);
	}),

	clickEvent: on('click', function(event) {
		event.stopPropagation();
		let index = event.target.selectionStart;
		handleFocus(this, index, 0);
		this.sendAction('onclick', event, index);
	}),

	keyDown(event) {
		if (isModifierKeyActive(this, event)) {
			return true;
		}

		let handler = keyEvent({ event, disable: ['letters'] });
		if (handler.allowed) {
			if (!handler.throttle) {
				if (/arrow/.test(handler.keyName)) {
					return this.handleArrowKeys(event, handler);
				} else if (/^[0-9]$/.test(handler.keyName)) {
					return this.handleNumberKeys(event, handler);
				} else if (handler.keyName === 'delete') {
					return this.handleDeleteKey(event, handler);
				} else if (handler.keyName === 'tab') {
					this.sendAction('ontabkey', event);
				} else if (handler.keyName === 'enter') {
					this.sendAction('onsubmit', event);
				}
			}
		}
		return handler.preventDefault();
	}
});

function isModifierKeyActive(target, event) {
	let keyboard = getKeyboardStyle();
	if (keyboard === 'MAC' && event.metaKey) {
		return true;
	} else if (keyboard === 'PC' && event.ctrlKey) {
		return true;
	} else if (event.altKey) {
		event.preventDefault();
		return true;
	}
	return false;
}

function getKeyboardStyle() {
	if (/Macintosh/.test(window.navigator.userAgent)) {
		return 'MAC';
	} else {
		return 'PC';
	}
}

function getMeta(target) {
	if (target.$) {
		target = target.$();
	}
	let format = getData(target, 'format');
	let selection = getData(target, 'selection', 0);
	let position = getData(target, 'position', 0);

	let parser = getData(target, 'parser', null);
	let start, end, sectionFormat;
	if (!isNone(parser)) {
		sectionFormat = parser.getFormatSection(selection);
		let cursor = parser.current(selection);
		start = cursor.start;
		end = cursor.end;
	}
	return { format, selection, position, sectionFormat, start, end, parser };
}

function sectionBounds(target) {
	const { sectionFormat } = getMeta(target);
	let max;
	let min = 1;
	if (/^D(o|D)?$/.test(sectionFormat)) { // days of month
		const date = paperTime(get(target, '_date'));
		max = date.moment.daysInMonth();
	} else if (/^M(o|M)?$/.test(sectionFormat)) { // months of year
		max = 12;
	} else if (/^Y{1,4}$/.test(sectionFormat)) {
		max = isNone(get(target, 'max')) ? moment().add(100, 'years').endOf('year').year() : moment(get(target, 'max')).endOf('year').year();
		min = isNone(get(target, 'min')) ? moment().subtract(100, 'years').startOf('year').year() : moment(get(target, 'min')).startOf('year').year();
	}
	return { min, max }
}

function setSelected(target, start, end) {
	return new EmberPromise(resolve => {
		later(() => {
			const { selection } = getMeta(target);
			setSelectionRange(target, start, end);
			if (selection !== start) {
				setData(target, 'selection', start);
			}
			run(null, resolve, null);
		}, 10);
	});
}

function handleFocus(target, index=0, num=0) {
	// set cursor index and last num index
	setData(target, 'selection', index);
	setData(target, 'position', num);

	handleCursor(target, '');
	set(target, 'active', true);
}

function handleCursor(target, action='') {
	const { parser, selection } = getMeta(target);

	let cursor;
	if (action === 'next') {
		cursor = parser.next(selection);
	} else if (action === 'prev') {
		cursor = parser.prev(selection);
	} else {
		cursor = parser.current(selection);
	}
	return setSelected(target, cursor.start, cursor.end);
}

function linkedInputData(target) {
	let inputData = getData(target, 'linked');
	if (isNone(inputData)) {
		let link = get(target, 'name');
		if (!isEmpty(link)) {
			let inputs = $(`input[name=${link}]`);
			let elementId = get(target, 'elementId');
			let self = inputs.filter((key, el) => el.id === elementId);
			let index = inputs.index(self);

			inputData = { inputs, self, index };
			setData(target, 'linked', inputData);
		}
	}
	return inputData;
}

function inputFor(target, type='') {
	let { inputs, index } = linkedInputData(target);

	if (type === 'next') {
		index = index+1;
	} else if (type === 'prev') {
		index = index-1;
	}

	if (index < 0) {
		index = inputs.length-1;
	} else if (index >= inputs.length) {
		index = 0;
	}

	let input = inputs[index];
	return { input, index };
}

function moveToNextPosition(target) {
	const { format, end } = getMeta(target);

	setData(target, 'position', 0);
	if (end === format.length) {
		let { input } = inputFor(target, 'next');
		input = $(input);
		setData(input, 'selection', 0);
		setData(input, 'position', 0);
		input.focus();
		return resolve({ isNewInput: true, input });
	} else {
		return handleCursor(target, 'next').then(() => {
			setData(target, 'position', 0);
			return { isNewInput: false, input: target };
		});
	}
}

function moveToPrevPosition(target) {
	const { start } = getMeta(target);
	if (start === 0) {
		let { input } = inputFor(target, 'prev');
		input = $(input);
		const { sectionFormat, format } = getMeta(input);
		setData(input, 'selection', format.length);
		setData(input, 'position', sectionFormat.length);
		input.focus();
		return resolve({ isNewInput: true, input });
	} else {
		return handleCursor(target, 'prev').then(() => {
			const { sectionFormat } = getMeta(target);
			setData(target, 'position', sectionFormat.length);
			return { isNewInput: false, input: target };
		});
	}
}

function createSection(target, num, position, isReverse=false) {
	const value = get(target, 'value');
	const { sectionFormat, start, end } = getMeta(target);
	const substr = value.substring(start, end);
	let ds;

	// calculate new date from input
	if (isReverse) {
		ds = shiftRight(substr, num);
	} else {
		ds = shiftLeft(substr, num);
		if (position === 0) {
			let template = `000000000`.slice(0, sectionFormat.length);
			ds = shiftLeft(template, num);
		}
	}
	return ds;
}

function shiftLeft(str, val) {
	return (str + val).substr(1);
}

function shiftRight(str, val) {
	return (val + str).substr(0, str.length);
}

function mergeString(str, insert, start, end) {
	return str.substr(0, start) + insert + str.substr(end);
}

function setSelectionRange(target, start, end) {
	if (target.$) {
		target = target.$();
	}
	target.get(0).setSelectionRange(start, end);
}

function setData(target, key, value) {
	if (target.$) {
		target = target.$();
	}
	target.data(key, value);
}

function getData(target, key, defaultValue=null) {
	if (target.$) {
		target = target.$();
	}
	return target.data(key) || defaultValue;
}

