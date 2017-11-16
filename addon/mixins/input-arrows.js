/**
 * @module Mixins
 *
 */
import { get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import { isNone } from '@ember/utils';
import { later } from '@ember/runloop';
import dateFormatParser from 'ember-paper-time-picker/utils/date-format-parser';
import keyEvent from 'ember-paper-time-picker/utils/key-event';
import paperTime from 'ember-paper-time-picker/utils/paper-time';
import Mixin from '@ember/object/mixin';

/**
 * Input mixin to highlight selected text based on a format string
 *
 */
export default Mixin.create({
	format: '',

	setFormatParser: on('init', function() {
		if (isNone(get(this, 'formatParser'))) {
			set(this, 'formatParser', dateFormatParser(get(this, 'format')));
		}
	}),

	handleArrowKeys(event, actionName='onChange') {
		let allowed = ['left-arrow', 'right-arrow', 'up-arrow', 'down-arrow'];
		let handler = keyEvent({ event, allowed });
		if (!handler) {
			return true;
		}

		if (handler.allowed) {
			const el = event.target;
			const cursorIndex = el.selectionStart;
			const parser = get(this, 'formatParser');

			let cursor;
			if (handler.keyName === 'left-arrow') {
				cursor = parser.prev(cursorIndex);
			} else if (handler.keyName === 'right-arrow') {
				cursor = parser.next(cursorIndex);
			} else {
				cursor = parser.current(cursorIndex);
				let type = parser.getFormatSection(cursorIndex);
				let value = get(this, 'value');

				let val;
				if (handler.keyName === 'up-arrow') {
					val = paperTime(value).addFormatted(1, type);
				} else {
					val = paperTime(value).subFormatted(1, type);
				}

				if (val.moment.isValid() && this.isValid(val.milli())) {
					set(this, 'value', val.milli());
					this.sendAction(actionName, this.get('value'));
				}
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
