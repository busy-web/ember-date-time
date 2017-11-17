/**
 * @module Mixins
 *
 */
import Mixin from '@ember/object/mixin';
import keyEvent from 'ember-paper-time-picker/utils/key-event';

/**
 * Helper mixin for handling numbers in inputs
 *
 */
export default Mixin.create({
	keyDown(event) {
		let handler = this._super(event);
		if (handler === false) {
			return false;
		}

		if (!handler || !handler.allowed) {
			handler = keyEvent({ event, allowed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
			if (handler.allowed) {
				if (handler.throttle) {
					return handler.preventDefault();
				}

				handler.type = 'input-numbers';
				event.handler = handler;
			}
		}
		return handler;
	}
});
