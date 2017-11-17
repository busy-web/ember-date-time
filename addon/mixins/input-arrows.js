/**
 * @module Mixins
 *
 */
import keyEvent from 'ember-paper-time-picker/utils/key-event';
import Mixin from '@ember/object/mixin';

/**
 * Input mixin to highlight selected text based on a format string
 *
 */
export default Mixin.create({
	keyDown(event) {
		let handler = this._super(event);
		if (handler === false) {
			return false;
		}

		if (!handler || !handler.allowed) {
			handler = keyEvent({ event, allowed: ['left-arrow', 'right-arrow', 'up-arrow', 'down-arrow'] });
			if (handler.allowed) {
				if (handler.throttle) {
					return handler.preventDefault();
				}

				handler.type = 'input-arrows';
				event.handler = handler;
			}
		}
		return handler;
	}
});
