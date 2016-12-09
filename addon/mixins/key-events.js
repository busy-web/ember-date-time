/**
 * @module Mixins
 *
 */
import Ember from 'ember';
import { Assert } from 'busy-utils';

export default Ember.Mixin.create({
	_timeout: false,

	throttleKey(evt, time=50) {
		if (!this._timeout) {
			this._timeout = true;
			const _this = this;
			this.set('_timeout', window.setTimeout(function() {
				_this._timeout = false;
			}, time));
			return true;
		} else {
			return this.preventDefault(evt);
		}
	},

	/**
	 * Takse a event and returns a readable key event for main key events like enter, tab arrow keys
	 *
	 * @public
	 * @method keyCodeTranslator
	 * @param evt {object}
	 * @return {string}
	 */
	translate(key) {
		const keys = { 9: 'tab', 13: 'enter', 8: 'delete', 37: 'left-arrow', 38: 'up-arrow', 39: 'right-arrow', 40: 'down-arrow' };
		return keys[key] || -1;
	},

	isKey(evt, keys) {
		Assert.isObject(evt);
		Assert.isArray(keys);

		const code = this.getKeyCode(evt);
		const name = this.translate(code);
		let isKey = false;
		if (keys.indexOf(code) !== -1) {
			isKey = true;
		} else if (name !== -1 && keys.indexOf(name) !== -1) {
			isKey = true;
		}
		return isKey;
	},

	/**
	 * only allows up and down arrows and tabs to be affected
	 *
	 * @private
	 * @method onlyAllowArrows
	 * @param {event} key press event
	 */
	isAllowedKey(evt, keys) {
		// only allows arrow keys and tab key
		const isArrow = this.isKey(evt, keys);

		// if allowed return true
		if (isArrow) {
			return true;
		} else {
			return this.preventDefault(evt);
		}
	},

	getKeyCode(evt) {
		return (evt.keyCode || evt.which);
	},

	onKeyPressed(evt, keys, callback, target) {
		Assert.isObject(evt);
		Assert.isArray(keys);
		Assert.test('callback must be a function', typeof callback === 'function');

		// set default target for target
		target = Ember.isNone(target) ? this : target;

		if (this.isKey(evt, keys)) {
			callback.call(target);
		}
	},

	preventDefault(evt) {
		evt.returnValue = false;
		if(evt.preventDefault) {
			evt.preventDefault();
		}
		return false;
	}
});
