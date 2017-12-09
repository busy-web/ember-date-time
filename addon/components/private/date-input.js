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
import TextField from "@ember/component/text-field"
import keyEvent from '@busy-web/ember-date-time/utils/key-event';
import _time from '@busy-web/ember-date-time/utils/time';
import {
	getCursorPosition,
	getFormatSection,
	longFormatDate
} from '@busy-web/ember-date-time/utils/format';

/***/

/**
 *
 */
export default TextField.extend({
	classNames: ['busyweb', 'emberdatetime', 'p-date-input'],
	classNameBindings: ['isDateInRange::invalid', 'active'],

	type: 'text',

	timestamp: null,
	min: null,
	max: null,

	format: 'MM/DD/YYYY',

	_date: null,
	value: null,
	active: false,

	name: null,
	selection: 0,
	position: 0,
	defaultFocus: 0,

	isDateInRange: computed('value', function() {
		const { position } = getMeta(this);

		// when value is null or lastNumIndex is null or lastNumIndex is not 0 then it is in a temp state when invalid is ignored
		if (isNone(getValue(this)) || isNone(position) || position !== 0) {
			return true;
		}

		// get the current value as a date object
		const date = _time(getValue(this), get(this, 'format'));

		// date must be valid and within range to be a valid date range
		if (date.isValid() && this.isDateInBounds(date)) {
			return true;
		}
		return false;
	}),

	setupComponent: on('willInsertElement', function() {
		let format = get(this, 'format');
		format = longFormatDate(format);

		this.timestampChange();

		setData(this.$(), 'format', format);
		setData(this.$(), 'selection', 0);
		setData(this.$(), 'position', 0);
		setData(this.$(), 'linked', null);

		setValue(this, getValue(this));
		set(this, 'keyboard', getKeyboardStyle());
	}),

	timestampChange: observer('timestamp', function() {
		let date;
		if (!isNone(get(this, 'timestamp'))) {
			date = _time(get(this, 'timestamp'));
		} else {
			date = _time();
		}
		setValue(this, date.format(get(this, 'format')));
		set(this, '_date', date.timestamp());
	}),

	isValid(date) {
		if (date.isValid()) {
			return true;
		}
		return false;
	},

	isDateInBounds(date) {
		const max = get(this, 'max');
		const min = get(this, 'min');
		if (isNone(max) && isNone(min)) {	// no min or max date
			return true;
		} else if (date.timestamp() >= min && isNone(max)) { // date is greater than min date and no max date
			return true;
		} else if (isNone(min) && date.timestamp() <= max) { // no min date and date is less than max date
			return true;
		} else if (date.timestamp() >= min && date.timestamp() <= max) { // date is greater than min date and date is less than max date
			return true;
		}
		return false;
	},

	submitChange(value) {
		if (this.isValid(value)) {
			let val = value.timestamp();
			set(this, '_date', val);
			this.sendAction('onchange', val);
			return true;
		}
		return false;
	},

	finalizeDateSection() {
		let date = _time(getValue(this), get(this, 'format'));
		if (date.isValid()) {
			if (get(this, '_date') !== date.timestamp()) {
				this.submitChange(date);
			}
			setData(this.$(), 'position', 0);
			return true;
		}
		return false;
	},

	fixDate() {
		let { start, end } = getMeta(this);
		let { min, max } = sectionBounds(this);
		let valueSection = getValue(this).substring(start, end);

		if (parseInt(valueSection, 10) < min) {
			valueSection = ('0000000' + min).substr(-(`${max}`.length));
		} else if (parseInt(valueSection, 10) > max) {
			valueSection = `${max}`;
		}
		let newVal = mergeString(getValue(this), valueSection, start, end);
		setValue(this, newVal);
	},

	setDateSection(valueSection, position) {
		let { sectionFormat, start, end } = getMeta(this);
		let { min, max } = sectionBounds(this);

		// moves the start ahead on position when the valueSection
		// is intended for a format section that has less position
		// than the max numbers positions.
		if (sectionFormat.length < `${max}`.length) {
			if (position > sectionFormat.length) {
				start += 1;
			}
		}

		// merge the date string section into the current date string
		let newVal = mergeString(getValue(this), valueSection, start, end);

		setValue(this, newVal);

		// set new number position and handle cursor selection
		let num = parseInt(valueSection, 10);
		if ((position >= `${max}`.length) || (num > min && num*10 > max)) {
			// create a new date object
			this.fixDate();
			this.finalizeDateSection();
			moveToNextPosition(this);
		} else {
			setData(this.$(), 'position', position);
			handleCursor(this, '');
		}
	},

	handleNumberKeys(event, handler) {
		let { sectionFormat, position } = getMeta(this);
		if (!/^(D(o|D))|(M(o|M))|(Y{1,4})|(hh?)|(HH?)|(mm?)|(ss?)$/.test(sectionFormat)) {
			return handler.preventDefault();
		}

		let valueSection = createSection(this, handler.keyName, position, false);
		position = position + 1;

		this.setDateSection(valueSection, position);
		return handler.preventDefault();
	},

	handleLetterKeys(event, handler) {
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

	upDownArrows(keyName) {
		const { sectionFormat, start, end } = getMeta(this);
		const type = sectionFormatType(this);
		const _date = get(this, '_date');

		let isUp = ['ArrowUp', '=', '+'].indexOf(keyName) !== -1;
		let isDown = ['ArrowDown', '-', '_'].indexOf(keyName) !== -1;

		// for am pm up down arrows increase the time or decrease
		// the time accordingly so that the day does not change.
		// So hitting up arrow 2 times will change from 'am' => 'pm' => 'am'
		// and the actual date has not changed.
		if (type === 'meridian') {
			const substr = getValue(this).substring(start, end);
			if (isUp && substr.toLowerCase() === 'pm') {
				isUp = false;
				isDown = true;
			} else if (isDown && substr.toLowerCase() === 'am') {
				isDown = false;
				isUp = true;
			}
		}

		let val;
		if (isUp) {
			val = _time(_date).addFormatted(1, sectionFormat);
		} else if (isDown) {
			val = _time(_date).subFormatted(1, sectionFormat);
		}

		if (val) {
			setValue(this, val.format(get(this, 'format')));
			handleCursor(this, '');
		}
	},

	handleArrowKeys(event, handler) {
		if (/^[*/><^]$/.test(handler.keyName)) {
			return handler.preventDefault();
		}

		if (handler.keyName === 'ArrowLeft') {
			handleCursor(this, 'prev');
		} else if (handler.keyName === 'ArrowRight') {
			handleCursor(this, 'next');
		} else {
			this.upDownArrows(handler.keyName);
		}

		this.finalizeDateSection();
		return handler.preventDefault();
	},

	focusInEvent: on('focusIn', function(event) {
		let { selection, position } = getMeta(this, $(event.target));
		handleFocus(this, selection, position, true);

		let type = sectionFormatType(this);
		this.sendAction('onfocus', event, type);
		let os = getOSType();
		if (os === 'iOS') {
			if (!getData(this.$(), 'overrideFocus')) {
				this.$().blur();
			} else {
				setData(this.$(), 'overrideFocus', false);
			}
		} else if (os === 'Android') {
			this.$().blur();
		}
	}),

	focusOutEvent: on('focusOut', function(event) {
		this.set('active', false);
		this.sendAction('onblur', event);
	}),

	clickEvent: on('click', function(event) {
		event.stopPropagation();
		let index = event.target.selectionStart;

		set(this, '__lastType', null);
		handleFocus(this, index, 0);

		let type = sectionFormatType(this);
		this.sendAction('onclick', event, index, type);

		// hand mobile focus
		let os = getOSType();
		if (os === 'iOS' || os === 'Android') {
			setData(this.$(), 'overrideFocus', true);
			later(() => this.$().focus(), 10);
		}
	}),

	keyDown(event) {
		// TODO:
		// handle arrows for am pm and allow letters for am pm
		if (isModifierKeyActive(this, event)) {
			return true;
		}

		let handler = keyEvent({ event, disable: ['composition'] });
		if (handler.allowed) {
			if (!handler.throttle) {
				if (handler.type === 'arrow' || handler.type === 'math' || handler.keyName === '_') {
					return this.handleArrowKeys(event, handler);
				} else if (handler.type === 'number') {
					return this.handleNumberKeys(event, handler);
				} else if (handler.type === 'letter') {
					return this.handleLetterKeys(event, handler);
				} else if (handler.keyName === 'Backspace') {
					return this.handleDeleteKey(event, handler);
				} else if (handler.keyName === 'Tab') {
					this.sendAction('ontabkey', event);
				} else if (handler.keyName === 'Enter') {
					this.sendAction('onsubmit', event);
				}
			}
		}
		return handler.preventDefault();
	}
});

function getOSType() {
	if (/(iPhone|iPad|iPod)/.test(window.navigator.userAgent)) {
		return 'iOS';
	} else if (/Android/.test(window.navigator.userAgent)) {
		return 'Android';
	}
}

function setValue(target, value) {
	set(target, 'value', value.replace(/[ ]*$/, '  '));
}

function getValue(target) {
	return get(target, 'value');
}

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

function getMeta(target, el) {
	el = el || target.$();
	let format = getData(el, 'format');
	let selection = getData(el, 'selection', 0);
	let position = getData(el, 'position', 0);

	let start, end, sectionFormat;
	let value = getValue(target);
	sectionFormat = getFormatSection(format, value, selection);
	let cursor = getCursorPosition(format, value, selection);
	if (!isNone(cursor)) {
		start = cursor.start;
		end = cursor.end;
	}
	return { format, selection, position, sectionFormat, start, end };
}

function sectionBounds(target) {
	let type = sectionFormatType(target);
	let max, min = 1;
	if (type === 'days') {
		const date = _time(get(target, '_date'));
		max = date.daysInMonth();
	} else if (type === 'months') {
		max = 12;
	} else if (type === 'years') {
		max = isNone(get(target, 'max')) ? _time().add(100, 'years').endOf('year').year() : _time(get(target, 'max')).endOf('year').year();
		min = isNone(get(target, 'min')) ? _time().subtract(100, 'years').startOf('year').year() : _time(get(target, 'min')).startOf('year').year();
	} else if (type === 'hours') {
		max = 12;
	} else if (type === 'm-hours') {
		min = 0;
		max = 24;
	} else if (type === 'minutes') {
		min = 0;
		max = 59;
	} else if (type === 'seconds') {
		min = 0;
		max = 59;
	}
	return { min, max }
}

function sectionFormatType(target) {
	const { sectionFormat } = getMeta(target);
	return _time.formatStringType(sectionFormat);
}

function handleFocus(target, index=0, num=0, triggerChange=true) {
	const defaultFocus = get(target, 'defaultFocus') || 0;
	const value = getValue(target);

	if (index >= value.length) {
		index = defaultFocus;
	} else if (index === value.length-1) {
		index = index-1;
	}

	// set cursor index and last num index
	setData(target.$(), 'selection', index);
	setData(target.$(), 'position', num);

	handleCursor(target, '', triggerChange);
	set(target, 'active', true);
}

function handleCursor(target, action='', triggerChange=true) {
	return new EmberPromise(resolve => {
		later(() => {
			const { format, selection } = getMeta(target);
			const value = getValue(target);

			let cursor;
			if (action === 'next') {
				cursor = getCursorPosition(format, value, selection, true, false);
			} else if (action === 'prev') {
				cursor = getCursorPosition(format, value, selection, false, true);
			} else {
				cursor = getCursorPosition(format, value, selection, false, false);
			}

			if (cursor.end !== value.length-1) {
				setSelectionRange(target.$(), cursor.start, cursor.end);
				if (selection !== cursor.start) {
					setData(target.$(), 'selection', cursor.start);
				}

				if (triggerChange) {
					let lastType = get(target, '__lastType');
					let type = sectionFormatType(target);
					if (lastType !== type) {
						set(target, '__lastType', type);
						target.sendAction('oncursor', type);
					}
				}
			} else {
				handleCursor(target, '', triggerChange);
			}

			run(null, resolve, null);
		}, 10);
	});
}

function linkedInputData(target) {
	let inputData = getData(target.$(), 'linked');
	if (isNone(inputData)) {
		let link = get(target, 'name');
		if (!isEmpty(link)) {
			let inputs = $(`input[name=${link}]`);
			let elementId = get(target, 'elementId');
			let self = inputs.filter((key, el) => el.id === elementId);
			let index = inputs.index(self);

			inputData = { inputs, self, index };
			setData(target.$(), 'linked', inputData);
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

	setData(target.$(), 'position', 0);
	if (end === format.length) {
		let { input } = inputFor(target, 'next');
		input = $(input);
		setData(input, 'selection', 0);
		setData(input, 'position', 0);
		input.focus();
		return resolve({ isNewInput: true, input });
	} else {
		return handleCursor(target, 'next').then(() => {
			setData(target.$(), 'position', 0);
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
		return EmberPromise(resolve => {
			later(() => {
				run(null, resolve, { isNewInput: true, input });
			}, 1);
		});
	} else {
		return handleCursor(target, 'prev').then(() => {
			const { sectionFormat } = getMeta(target);
			setData(target.$(), 'position', sectionFormat.length);
			return { isNewInput: false, input: target };
		});
	}
}

function createSection(target, num, position, isReverse=false) {
	const value = getValue(target);
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

function setSelectionRange(el, start, end) {
	el.get(0).setSelectionRange(start, end);
}

function setData(el, key, value) {
	el.data(key, value);
}

function getData(el, key, defaultValue=null) {
	return el.data(key) || defaultValue;
}

