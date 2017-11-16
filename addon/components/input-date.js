/**
 * @module components
 *
 */
import { computed, get } from '@ember/object';
import { isNone } from '@ember/utils';
import Component from '@ember/component';
import layout from '../templates/components/input-date';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import InputArrows from 'ember-paper-time-picker/mixins/input-arrows';
import InputNumbers from 'ember-paper-time-picker/mixins/input-numbers';

export default Component.extend(InputArrows, InputNumbers, {
	classNames: ['paper-date-input'],
  layout,

	value: null,
	minDate: null,
	maxDate: null,

	format: 'MM/DD/YYYY',
	formatMeta: null,

	maxlength: computed('format', function() {
		return (this.get('format') || '').length;
	}),

	_date: computed('value', function() {
		return TimePicker.getMomentDate(this.get('value') || undefined).format('MM/DD/YYYY');
	}),

	isValid(date) {
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
			//const el = evt.target;

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

			if (this.handleArrowKeys(evt)) {
				return false;
			}

			if (this.handleNumberKeys(evt)) {
				return false;
			}

			evt.preventDefault();
			return false;
		}
	}
});



