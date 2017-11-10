/**
 * @module components
 *
 */
import EmberObject, { computed, get, set } from '@ember/object';
import { later } from '@ember/runloop';
import { isNone } from '@ember/utils';
import Component from '@ember/component';
import layout from '../templates/components/input-date';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import moment from 'moment';

export default Component.extend({
	classNames: ['paper-date-input'],
  layout,

	value: null,
	minDate: null,
	maxDate: null,

	format: 'MM/DD/YYYY',
	formatMeta: null,

	init() {
		this._super();
		set(this, 'formatMeta', setFormatData(get(this, 'format')));
	},

	maxlength: computed('format', function() {
		return (this.get('format') || '').length;
	}),

	_date: computed('value', function() {
		return TimePicker.getMomentDate(this.get('value') || undefined).format('MM/DD/YYYY');
	}),

	isDateInBounds(date) {
		let maxDate = get(this, 'maxDate');
		let minDate = get(this, 'minDate');
		if (isNone(maxDate) && isNone(minDate)) {					// no min or max date
			return true;
		} else if (date >= minDate && isNone(maxDate)) {	// date is greater than min date and no max date
			return true;
		} else if (isNone(minDate) && date <= maxDate) {	// no min date and date is less than max date
			return true;
		} else if (date >= minDate && date <= maxDate) {	// date is greater than min date and date is less than max date
			return true;
		}
		return false;
	},

	actions: {
		focusAction() {
			const el = this.$('input').get(0);
			let start = this.get('format').search(/D/);

			el.setSelectionRange(start, start + 2);

			this.sendAction('onFocus');
		},

		clickAction() {
			this.sendAction('onClick');
		},

		keyUpAction(/*value, event*/) {
			return true;
		},

		keyDownAction(value, evt) {
			const el = evt.target;

			// TODO:
			//
			// add support for number inputs for setting dates
			//

			if (evt.which === 9) {
				let res;
				if(this.get('onTabKey')) {
					res = this.get('onTabKey')(evt);
				}
				return (res === undefined) ? true : res;
			}

			if (evt.which === 37 || evt.which === 39 || evt.which === 38 || evt.which === 40) { // arrow keys
				evt.preventDefault();
				const sIndex = el.selectionStart;
				const meta = get(this, 'formatMeta');
				if (evt.which === 37 || evt.which === 39) { // left right arrow keys
					if (evt.which === 37) { // left
						const { start, end } = meta.prev(sIndex);
						el.setSelectionRange(start, end);
					} else { // right
						const { start, end } = meta.next(sIndex);
						el.setSelectionRange(start, end);
					}
				} else if (evt.which === 38 || evt.which === 40) { // up down arrow keys
					let { start, end } = meta.current(sIndex);
					let type = this.get('format').substring(start, end);
					let value = this.get('value');
					let val;
					if (evt.which === 38) { // up
						val = adjustDate(type, this.get('format'), value, true);
					} else { // down
						val = adjustDate(type, this.get('format'), value, false);
					}

					if (this.isDateInBounds(val)) {
						set(this, 'value', val);
						this.sendAction('onChange', this.get('value'));
					}

					later(() => {
						el.setSelectionRange(start, end);
					}, 1);
				}
			}
		}
	}
});

function convertType(type) {
	// TODO:
	//
	// add more conversions to this for more support and test more date types
	//
	let map = {
		'DD': 'd',
		'MM': 'M',
		'mm': 'm',
		'HH': 'h',
		'hh': 'h',
		'YYYY': 'y',
		'ss': 's'
	};
	if (map[type]) {
		return map[type];
	}
	return type;
}

function adjustDate(type, format, value, isAdd=true) {
	let date = moment(value);
	let cType = convertType(type);
	if (isAdd) {
		return date.add(1, cType).valueOf();
	} else {
		return date.subtract(1, cType).valueOf();
	}
}

function normalizeIndex(key, startBound, endBound) {
	if (key < startBound) {
		key = startBound;
	} else if (key > endBound) {
		key = endBound;
	}
	return key;
}

function setFormatData(format) {
	const reg = new RegExp(/\/|\.|-|,|]/);
	let split = format.split(reg);
	let end = 0;
	let sections = [];
	split.forEach(p => {
		let start = end;
		end += p.length;
		sections.push({ start, end });
		end += 1;
	});

	let index = 0;
	let map = new window.Map();
	for(let i=0; i<format.length; i++) {
		if (reg.test(format[i])) {
			map.set(i, index);
			index += 1;
		} else {
			map.set(i, index);
		}
	}

	return CursorManager.create({ format, map, sections });
}

const CursorManager = EmberObject.extend({
	format: '',
	map: null,
	sections: null,

	next(index) {
		return this._getter(index, true, false);
	},

	prev(index) {
		return this._getter(index, false, true);
	},

	current(index) {
		return this._getter(index, false, false);
	},

	_getter(index, isAdd=false, isSubtract=false) {
		index = normalizeIndex(index, 0, get(this, 'format.length') - 1);
		const map = get(this, 'map');
		const sections = get(this, 'sections');

		let mIndex = map.get(index);
		if (isAdd) {
			mIndex = normalizeIndex(mIndex + 1, 0, sections.length-1);
		} else if (isSubtract) {
			mIndex = normalizeIndex(mIndex - 1, 0, sections.length-1);
		}
		return sections[mIndex];
	}
});
