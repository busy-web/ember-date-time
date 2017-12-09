/**
* @module utils
*
*/
import { isNone } from '@ember/utils';
import EmberObject from '@ember/object';
import { formatNumber } from './string';
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
	addElement(type, elementNames, value, parentId) {
		value = formatNumber(value);
    const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
    const clockNumber = clock.select(`#${elementNames.text}`);
		if (!isNone(clockNumber)) {
			clockNumber.removeClass('interior-white');
		}

    const bigCircle = clock.select(`#big-circle-${type}`);
    clock.select(`#${elementNames.line}`).insertBefore(bigCircle);
    clock.select(`#${elementNames.circle}`).insertBefore(bigCircle);
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
  activateClockNumber(type, elementNames, value, parentId) {
		value = formatNumber(value);
    const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
		const clockNumber = clock.select(`#${elementNames.text}`);
		if (!isNone(clockNumber) && !clockNumber.hasClass('interior-white')) {
			clockNumber.addClass('interior-white');
			clock.select(`#${elementNames.line}`).appendTo(clock);
			clock.select(`#${elementNames.circle}`).appendTo(clock);
			clockNumber.animate({ fill: "white" }, 100, mina.easein).appendTo(clock);
			return true;
		} else {
			clock.select(`#${elementNames.line}`).appendTo(clock);
			clock.select(`#${elementNames.circle}`).appendTo(clock);
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
	enableClockNumber(type, elementNames, value, parentId) {
		const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
		const section = clock.select(`#${elementNames.section}`);
		if (!isNone(section)) {
			section.removeClass('disabled');
		}

		const clockNumber = clock.select(`#${elementNames.text}`);
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
	disableClockNumber(type, elementNames, value, parentId) {
		const clock = new Snap(`#${parentId} #clocks-${type}-svg`);
		const section = clock.select(`#${elementNames.section}`);
		if (!isNone(section) && !section.hasClass('disabled')) {
			section.addClass('disabled');
		}

		const clockNumber = clock.select(`#${elementNames.text}`);
		if (!isNone(clockNumber) && !clockNumber.hasClass('disabled')) {
			clockNumber.addClass('disabled');
		}
	}
});

