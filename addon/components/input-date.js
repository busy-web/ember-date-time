import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/input-date';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';

export default Component.extend({
	classNames: ['paper-date-input'],

  layout,


	value: null,
	format: 'MM/DD/YYYY',

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

		keyUpAction(value, event) {
		},

		keyDownAction(value, event) {
			const el = event.target;
			const sIndex = el.selectionStart;

			console.log('event', event.which, event);
			if (event.which === 37) { // left
				let target = this.get('format')[sIndex];
				target = this.get('format')[this.get('format').indexOf(target) - 2];
				let start = this.get('format').indexOf(target);
				let last = this.get('format').lastIndexOf(target) + 1;
				console.log('left', start, last, target);
				el.setSelectionRange(start, last);
			} else if (event.which === 39) { // right
				let target = this.get('format')[sIndex];
				target = this.get('format')[this.get('format').lastIndexOf(target) + 2];
				let start = this.get('format').indexOf(target);
				let last = this.get('format').lastIndexOf(target) + 1;
				console.log('right', start, last, target);
				el.setSelectionRange(start, last);
			} else if (event.which === 40) { // down

			} else if (event.which === 38) { // up

			}
		}
	}
});
