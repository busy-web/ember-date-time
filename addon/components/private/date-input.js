/**
 * @module components
 *
 */
import $ from 'jquery';
import { Promise as EmberPromise, resolve } from 'rsvp';
import { observer, computed, get, getWithDefault, set } from '@ember/object';
import { isNone, isEmpty } from '@ember/utils';
//import { on } from '@ember/object/evented';
import { run, later } from '@ember/runloop';
import TextField from "@ember/component/text-field"
import keyEvent from '@busy-web/ember-date-time/utils/key-event';
import _time from '@busy-web/ember-date-time/utils/time';
import { bind, unbind, isEventLocal } from '@busy-web/ember-date-time/utils/event';

import {
	getCursorPosition,
	getFormatSection,
	longFormatDate
} from '@busy-web/ember-date-time/utils/format';

import {
	YEAR_FLAG,
	MONTH_FLAG,
	//WEEKDAY_FLAG,
	DAY_FLAG,
	HOUR_FLAG,
	MINUTE_FLAG,
	SECONDS_FLAG,
	MERIDIAN_FLAG
} from '@busy-web/ember-date-time/utils/constant';

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
	//value: '',
	active: false,

	name: null,
	selection: 0,
	position: 0,
	defaultFocus: 0,

	isDateInRange: computed('value', function() {
		// before render the position has not been set so
		// resume calculations as if position were 0
		let position = 0;
		if (this.$() && this.$().length && !isEmpty(getData(this.$(), 'format'))) {
			let meta = getMeta(this);
			position = meta.position;
		}

		// when value is null or lastNumIndex is null or lastNumIndex is not 0 then it is in a temp state when invalid is ignored
		if (isNone(getValue(this)) || isNone(position) || position !== 0) {
			return true;
		}

		// get the current value as a date object
		const date = getDate(this);

		// date must be valid and within range to be a valid date range
		if (date.isValid() && this.isDateInBounds(date)) {
			return true;
		}
		return false;
	}),

	/**
	 * initialize the value before the component
	 * is rendered.
	 *
	 */
	init(...args) {
		this._super(...args);

		let date;
		if (!isNone(get(this, 'timestamp'))) {
			date = _time(get(this, 'timestamp'));
		} else {
			date = _time();
		}

		setValue(this, date.format(get(this, 'format')));
		set(this, '_date', date.timestamp());
		set(this, '_dateRef', date.timestamp());
	},

	/**
	 * initialize the DOM object after render has
	 * finished.
	 *
	 */
	didInsertElement(...args) {
		this._super(...args);

		const target = this.$().get(0);

		bind(
			target,
			'click',
			`ember-date-time.date-input.${this.get('elementId')}`,
			(...args) => this.clickEvent(...args),
			{ capture: true, rebind: true }
		);

		bind(
			target,
			'focusin',
			`ember-date-time.date-input.${this.get('elementId')}`,
			(...args) => this.focusInEvent(...args),
			{ capture: true, rebind: true }
		);

		bind(
			target,
			'focusout',
			`ember-date-time.date-input.${this.get('elementId')}`,
			(...args) => this.focusOutEvent(...args),
			{ capture: true, rebind: true }
		);

		let format = get(this, 'format');
		format = longFormatDate(format);

		setData(this.$(), 'format', format);
		setData(this.$(), 'selection', 0);
		setData(this.$(), 'position', 0);
		setData(this.$(), 'linked', null);

		set(this, 'keyboard', getKeyboardStyle());
	},

	willDestroyElement(...args) {
		this._super(...args);

		const target = this.$().get(0);

		unbind(target, 'click', `ember-date-time.date-input.${this.get('elementId')}`);
		unbind(target, 'focusin', `ember-date-time.date-input.${this.get('elementId')}`);
		unbind(target, 'focusout', `ember-date-time.date-input.${this.get('elementId')}`);
	},

	timestampChange: observer('timestamp', function() {
		let date = _time(get(this, 'timestamp'));
		setValue(this, date.format(get(this, 'format')));
		set(this, '_date', date.timestamp());
		set(this, '_dateRef', date.timestamp());
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
		let date = getInBoundsDate(getDate(this), get(this, 'min'), get(this, 'max'));
		let selectRound = getWithDefault(this, 'selectRound', 1);
		if (selectRound%date.minute() !== 0) {
			date = _time(_time.round(date.timestamp(), selectRound));
			setValue(this, date.format(get(this, 'format')));
		}

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
		let { sectionFormat } = getMeta(this);
		if (!/^(MMMM?|A|a)$/.test(sectionFormat)) {
			return handler.preventDefault();
		}

		if (/^[aA]$/.test(sectionFormat)) {
			meridianLetters(this, handler.keyName);
		} else {
			monthLetters(this, handler.keyName);
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

	upDownArrows(keyName) {
		const { sectionFormat, start, end } = getMeta(this);
		const type = sectionFormatType(this);
		let _date = get(this, '_date');

		let isUp = ['ArrowUp', '=', '+'].indexOf(keyName) !== -1;
		let isDown = ['ArrowDown', '-', '_'].indexOf(keyName) !== -1;

		// for am pm up down arrows increase the time or decrease
		// the time accordingly so that the day does not change.
		// So hitting up arrow 2 times will change from 'am' => 'pm' => 'am'
		// and the actual date has not changed.
		if (type === MERIDIAN_FLAG) {
			const substr = getValue(this).substring(start, end);
			if (isUp && substr.toLowerCase() === 'pm') {
				isUp = false;
				isDown = true;
			} else if (isDown && substr.toLowerCase() === 'am') {
				isDown = false;
				isUp = true;
			}
		} else if (/^mm?/.test(type)) {
			if (getWithDefault(this, 'selectRound', 1) > 1) {
				if (isUp) {
					_date = _time(_date).add(get(this, 'selectRound')-1, 'minutes').timestamp();
				} else {
					_date = _time(_date).subtract(get(this, 'selectRound')+1, 'minutes').timestamp();
				}
			}
		}

		let val;
		if (isUp) {
			val = _time(_date).addFormatted(1, sectionFormat);
		} else if (isDown) {
			val = _time(_date).subFormatted(1, sectionFormat);
		}

		let bounds = _time.isDateInBounds(val, get(this, 'min'), get(this, 'max'));
		if (bounds.isAfter || bounds.isBefore) {
			if (/^M(M|o)?$/.test(sectionFormat)) {
				if (isUp && !_time.isDateAfter(_time(val).startOf('month'), get(this, 'max'))) {
					val = val.date(_time(get(this, 'max')).date());
					bounds = _time.isDateInBounds(val, get(this, 'min'), get(this, 'max'));
				} else if (!isUp && !_time.isDateBefore(_time(val).endOf('month'))) {
					val = val.date(_time(get(this, 'min')).date());
					bounds = _time.isDateInBounds(val, get(this, 'min'), get(this, 'max'));
				}
			} else if (/^Y{1,4}$/.test(sectionFormat)) {
				if (isUp && !_time.isDateAfter(_time(val).startOf('year'), get(this, 'max'))) {
					val = val.date(_time(get(this, 'max')).date());
					bounds = _time.isDateInBounds(val, get(this, 'min'), get(this, 'max'));
				} else if (!isUp && !_time.isDateBefore(_time(val).endOf('year'))) {
					val = val.date(_time(get(this, 'min')).date());
					bounds = _time.isDateInBounds(val, get(this, 'min'), get(this, 'max'));
				}
			}
		}

		if (val) {
			if (!bounds.isBefore && !bounds.isAfter) {
				const newVal = val.format(get(this, 'format'));
				fixSelection(this, newVal);
				setValue(this, newVal);
				handleCursor(this, '');
			} else {
				flashWarn(this);
			}
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

	focusInEvent(event) {
		//let data = this.$().data();

		// prevent open picker from selecting the wrong section
		//if (!this.$().is(':active') || get(data, 'forceSelection') === true) {
			this.$().data('forceSelection', false);

			let { selection, position } = getMeta(this, this.$());
			handleFocus(this, selection, position, true);
		//}

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
	},

	focusOutEvent(event) {
		// check if the evt.target is local to this elements main parent
		let isLocal = isEventLocal(event, get(this, 'elementId'), '.emberdatetime');
		if (!isLocal) {
			this.set('active', false);
			this.sendAction('onblur', event);
		}
	},

	clickEvent(event) {
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
	},

	dragStart() {
		// store the current value so it can be fixed after the
		// drag is complete
		set(this, '__saveDragValue', getValue(this));
	},

	dragEnd() {
		// if the drag has changed the value then
		// replace it with the old value so the date format
		// is not changed
		if (getValue(this) !== get(this, '__saveDragValue')) {
			setValue(this, get(this, '__saveDragValue'));
		}
	},

	keyDown(event) {
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
					if (this.get('allowTab')) {
						return this.sendAction('ontabkey', event, handler);
					} else {
						this.sendAction('ontabkey', event, handler);
					}
				} else if (handler.keyName === 'Enter') {
					this.sendAction('onsubmit', event, get(this, '_date'), handler);
				}
			}
		}
		return handler.preventDefault();
	}
});

function flashWarn(target) {
	const el = target.$().parents('.emberdatetime');
	const className = 'flash-warn';
	el.addClass(className);
	setTimeout(() => el.removeClass(className), 100);
}

function getOSType() {
	if (/(iPhone|iPad|iPod)/.test(window.navigator.userAgent)) {
		return 'iOS';
	} else if (/Android/.test(window.navigator.userAgent)) {
		return 'Android';
	}
}

function getDate(target) {
	let format = getData(target.$(), 'format');

	if (isEmpty(format)) {
		format = get(target, 'format');
		format = longFormatDate(format);
	}

	let value = getValue(target);
	value = value.replace(/[ ]*$/, '');
	({ value, format } = addFormat(target, format, value));

	return _time(value, format);
}

function addFormat(target, format, value) {
	let dRef = _time(get(target, '_dateRef'));
	let stdTypes = _time.standardFormatTypes();

	Object.keys(stdTypes).forEach((key) => {
		let typeExp = new RegExp(stdTypes[key]);
		if (!typeExp.test(format)) {
			format = format + ' ' + key;
			value = value + ' ' + dRef.format(key);
		}
	});
	return { value, format };
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

function fixSelection(target, val) {
	let { selection } = getMeta(target);
	let value = getValue(target).trim()
	let v1 = value.substr(selection - value.length);
	let v2 = val.substr(selection - val.length);
	if (v2.length > v1.length) {
		setData(target.$(), 'selection', selection+1);
	}
}

function sectionBounds(target) {
	let type = sectionFormatType(target);
	let max, min = 1;
	if (type === DAY_FLAG) {
		const date = _time(get(target, '_date'));
		max = date.daysInMonth();
	} else if (type === MONTH_FLAG) {
		max = 12;
	} else if (type === YEAR_FLAG) {
		max = isNone(get(target, 'max')) ? _time().add(100, 'years').endOf('year').year() : _time(get(target, 'max')).endOf('year').year();
		min = isNone(get(target, 'min')) ? _time().subtract(100, 'years').startOf('year').year() : _time(get(target, 'min')).startOf('year').year();
	} else if (type === HOUR_FLAG) {
		max = 12;
	} else if (type === `m-${HOUR_FLAG}`) {
		min = 0;
		max = 24;
	} else if (type === MINUTE_FLAG) {
		min = 0;
		max = 59;
	} else if (type === SECONDS_FLAG) {
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

				// test for section with escape chars and skip the section
				// if they are found.
				let { start, sectionFormat } = getMeta(target);
				if (/^\[([\s\S])*\]$/.test(sectionFormat)) {
					if (action !== '') {
						handleCursor(target, action, triggerChange);
					} else {
						handleCursor(target, (start === 0 ? 'next' : 'prev'), triggerChange);
					}
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

function meridianLetters(target, keyName) {
	const value = getValue(target);
	let newVal;
	if (/^[aA]$/.test(keyName)) {
		newVal = value.replace(/[AP]M/, 'AM').replace(/[ap]m/, 'am');
	} else if (/^[pP]$/.test(keyName)) {
		newVal = value.replace(/[AP]M/, 'PM').replace(/[ap]m/, 'pm');
	} else if (/^[mM]$/.test(keyName)) {
		target.finalizeDateSection();
		moveToNextPosition(target);
	}

	if (!isEmpty(newVal)) {
		setValue(target, newVal);
		handleCursor(target, '');
	}
}

function monthLetters(target, keyName) {
	const { sectionFormat, position, start, end }  = getMeta(target);
	const value = getValue(target);
	const current = value.substr(start, end-start);
	const localeData = _time.localeData();
	let monthData = localeData._monthsShort;
	if (sectionFormat === 'MMMM') {
		monthData = localeData._months;
	}

	let startStr = current.substr(0, position) + keyName;
	let reg = new RegExp('^' + startStr, 'i');

	let results = monthData.filter(i => reg.test(i));
	let first = results[0];
	if (!isEmpty(first)) {
		let newVal = value.replace(current, first);
		setValue(target, newVal);
		if (results.length > 1) {
			setData(target.$(), 'position', position+1);
		} else {
			target.finalizeDateSection();
			moveToNextPosition(target);
		}
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


function getInBoundsDate(date, min, max) {
	const adjustTime = (d1, d2) => {
		if (d1.hours() < d2.hours()) d2.hours(d1.hours());
		if (d1.minutes() < d2.minutes()) d2.minutes(d1.minutes());
		if (d1.seconds() < d2.seconds()) d2.seconds(d1.seconds());
		return d2;
	};

	if (_time.isDateAfter(date, max)) {
		return adjustTime(_time(date), _time(max));
	} else if (_time.isDateBefore(date, min)) {
		return adjustTime(_time(min), _time(date));
	}
	return _time(date);
}
