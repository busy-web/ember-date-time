/**
 * @module Mixins
 *
 */
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import { isNone } from '@ember/utils';
import { later } from '@ember/runloop';
import Mixin from '@ember/object/mixin';
import keyEvent from 'ember-paper-time-picker/utils/key-event';
import dateFormatParser from 'ember-paper-time-picker/utils/date-format-parser';
import paperTime from 'ember-paper-time-picker/utils/paper-time';

/**
 * Helper mixin for handling numbers in inputs
 *
 */
export default Mixin.create({
	format: '',
	__places: 0,
	__currentSelection: 0,

	setFormatParser: on('init', function() {
		if (isNone(get(this, 'formatParser'))) {
			set(this, 'formatParser', dateFormatParser(get(this, 'format')));
		}
	}),

	handleNumberKeys(event, actionName='onChange') {
		let allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
		let handler = keyEvent({ event, allowed });

		if (!handler) {
			return true;
		}

		if (handler.allowed) {
			let selection = get(this, '__currentSelection');
			const el = event.target;
			const cursorIndex = el.selectionStart;
			const parser = get(this, 'formatParser');

			if (selection !== cursorIndex) {
				set(this, '__places', 0);
			}
			set(this, '__currentSelection', cursorIndex);

			let cursor = parser.current(cursorIndex);
			let type = parser.getFormatSection(cursorIndex);
			let value = get(this, 'value');
			let place = get(this, '__places');

			if (place === type.length) {
				place = 0;
			}

			let date = paperTime(value);
			let curVal = date.format(type);
			let curNum = curVal.charAt(place);
			let newNum = curVal.replace(curNum, handler.keyName);
			if (/^M(o?|M{0,3})$/.test(type) && !/^(0[1-9]|1[0-2])$/.test(newNum)) {
				if (place === 0) {
					if (newNum.charAt(0) === '0') {
						newNum = '01';
					} else if (newNum.charAt(0) === '1') {
						newNum = newNum.substr(place, 1) + '0';
					}
				}
			} else if (/^(Y{1,4}|(gg){1,2}|(GG){1,2})$/.test(type) && /^0/.test(newNum)) {
				newNum = '1' + newNum.substr(1);
			}

			let curDate = date.format(get(this, 'format'));
			let newVal = curDate.substr(0, cursor.start) + newNum + curDate.substr(cursor.end);
			date = paperTime(newVal, get(this, 'format'));

			console.log('cursorIndex', curDate, newVal);
			if (date.moment.isValid() && this.isValid(date.milli())) {
				set(this, '__places', place + 1);
				set(this, 'value', date.milli());
				this.sendAction(actionName, this.get('value'));
			}

			later(() => {
				el.setSelectionRange(cursor.start, cursor.end);
			}, 1);

			handler.preventDefault();
			return true;
		}
		return false;
	}
});
