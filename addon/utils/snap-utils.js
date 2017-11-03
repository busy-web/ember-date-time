/**
* @module utils
*
*/
import { isNone } from '@ember/utils';

import EmberObject from '@ember/object';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import Snap from 'snap-svg';
import mina from 'mina';

/***/
const SnapUtils = EmberObject.extend();

/**
 * `Util/SnapUtils`
 *
 */
export default SnapUtils.reopenClass({

	snap: Snap,

	/**
	 * removes an element based on the type and number passed in
	 *
	 * @public
	 * @method addElement
   * @param type {string} the type to set either minutes or hours
	 * @param value {number} the integer value for the time
	 * @param parentId {string} the parent element id set by ember
	 */
	addElement(type, value, parentId) {
		value = TimePicker.formatNumber(value);

    const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
    const strings = TimePicker.elementNames(type, value);

    const clockNumber = clock.select(`#${strings.text}`);
		if (!isNone(clockNumber)) {
			clockNumber.removeClass('interior-white');
		}

    const bigCircle = clock.select(`#big-circle-${type}`);
    clock.select(`#${strings.line}`).insertBefore(bigCircle);
    clock.select(`#${strings.circle}`).insertBefore(bigCircle);
	},

	/**
   * activates hour on the clock
   *
   * @private
   * @method activateClockNumber
   * @param type {string} the type to set either minutes or hours
	 * @param value {number} the integer value for the time
	 * @param parentId {string} the parent element id set by ember
   */
  activateClockNumber(type, value, parentId) {
		value = TimePicker.formatNumber(value);

    const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
    const strings = TimePicker.elementNames(type, value);

		const clockNumber = clock.select(`#${strings.text}`);
		if (!isNone(clockNumber) && !clockNumber.hasClass('interior-white')) {
			clockNumber.addClass('interior-white');
			clock.select(`#${strings.line}`).appendTo(clock);
			clock.select(`#${strings.circle}`).appendTo(clock);
			clockNumber.animate({ fill: "white" }, 100, mina.easein).appendTo(clock);
			return true;
		} else {
			clock.select(`#${strings.line}`).appendTo(clock);
			clock.select(`#${strings.circle}`).appendTo(clock);
			return false;
		}
  },

	/**
	 * enables an element that was disabled
	 *
	 * @public
	 * @method enableClockNumber
   * @param type {string} the type to set either minutes or hours
	 * @param value {number} the integer value for the time
	 * @param parentId {string} the parent element id set by ember
	 */
	enableClockNumber(type, value, parentId) {
		const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
    const strings = TimePicker.elementNames(type, value);

		const section = clock.select(`#${strings.section}`);
		if (!isNone(section)) {
			section.removeClass('disabled');
		}

		const clockNumber = clock.select(`#${strings.text}`);
		if (!isNone(clockNumber)) {
			clockNumber.removeClass('disabled');
		}
	},

	/**
	 * disables an element
	 *
	 * @public
	 * @method disableClockNumber
   * @param type {string} the type to set either minutes or hours
	 * @param value {number} the integer value for the time
	 * @param parentId {string} the parent element id set by ember
	 */
	disableClockNumber(type, value, parentId) {
		const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
    const strings = TimePicker.elementNames(type, value);

		const section = clock.select(`#${strings.section}`);
		if (!isNone(section) && !section.hasClass('disabled')) {
			section.addClass('disabled');
		}

		const clockNumber = clock.select(`#${strings.text}`);
		if (!isNone(clockNumber) && !clockNumber.hasClass('disabled')) {
			clockNumber.addClass('disabled');
		}
	}
});
