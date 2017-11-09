/**
 * @module components
 *
 */
import { computed, get, set } from '@ember/object';
import { later } from '@ember/runloop';
import Component from '@ember/component';
import layout from '../templates/components/input-date';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import moment from 'moment';

export default Component.extend({
	classNames: ['paper-date-input'],
  layout,

	value: null,
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
					let { start, end } = meta.get(sIndex);
					let type = this.get('format').substring(start, end);
					let value = this.get('value')
					if (evt.which === 38) { // up
						let val = adjustDate(type, this.get('format'), value, true);
						set(this, 'value', val);
					} else { // down
						let val = adjustDate(type, this.get('format'), value, false);
						set(this, 'value', val);
					}

					this.sendAction('onChange', this.get('value'));
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
	// add more conversions to this for more support
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

	return {
		map,
		format,
		sections,

		next(key) {
			key = key < 0 ? 0 : key;
			key = this.map.get(key);
			let n = key + 1;
			if (n >= this.format.length) {
				n = 0;
			}
			return this.sections[n];
		},

		prev(key) {
			key = key >= this.format.length ? this.format.length-1 : key;
			key = this.map.get(key);
			let n = key - 1;
			if (n < 0) {
				n = this.format.length-1;
			}
			return this.sections[n];
		},

		get(key) {
			return this.sections[this.map.get(key)];
		}
	};
}
