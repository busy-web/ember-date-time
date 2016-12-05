/**
* @module utils
*
*/
import Ember from 'ember';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import Snap from 'snap-svg';
import mina from 'mina';

/***/
const SnapUtils = Ember.Object.extend();

 /**
  * `Util/SnapUtils`
  *
  */
export default SnapUtils.reopenClass({
  /**
   * removes the hour that was passed in from the clock
   *
   * @private
   * @method removeHour
   * @param hour {string} hour to remove from clock
   */
  removeHour(hour, parentId) {
    let strings = TimePicker.elementNames('hours', hour);
    let clock = new Snap(`#${parentId} #clocks-hours-svg`);
    let bigCircle = clock.select('#big-circle-hours');

    clock.select(`#${strings.text}`).removeClass('interior-white');
    clock.select(`#${strings.line}`).insertBefore(bigCircle);
    clock.select(`#${strings.circle}`).insertBefore(bigCircle);
  },

  /**
   * removes the minute that was passed in from the clock
   *
   * @private
   * @method removeMinute
   * @param minute {string} minute to remove from clock
   */
  removeMinute(minute, parentId) {
    let strings = TimePicker.elementNames('minutes', minute);
    let clock = new Snap(`#${parentId} #clocks-minutes-svg`);
    let bigCircle = clock.select('#big-circle-minutes');

    if (!Ember.isNone(clock.select(`#min-text-${minute}`))) {
      clock.select(`#${strings.text}`).removeClass('interior-white');
    }

    clock.select(`#${strings.line}`).insertBefore(bigCircle);
    clock.select(`#${strings.circle}`).insertBefore(bigCircle);
  },

  /**
   * activates hour on the clock
   *
   * @private
   * @method hourTextActivate
   * @param hour {string} new active hour
   */
  hourTextActivate(hour, parentId) {
    let strings = TimePicker.elementNames('hours', hour);
    let clock = new Snap(`#${parentId} #clocks-hours-svg`);

    clock.select(`#${strings.text}`).addClass('interior-white');
    clock.select(`#${strings.line}`).appendTo(clock);
    clock.select(`#${strings.circle}`).appendTo(clock);
    clock.select(`#${strings.text}`).animate({ fill: "white" }, 100, mina.easein).appendTo(clock);
  },

  /**
   * activates minute with text on the clock
   *
   * @private
   * @method minuteTextActivate
   * @param minute {string} new active minute
   */
  minuteTextActivate(minute, parentId) {
		let strings = TimePicker.elementNames('minutes', minute);
		let clock = new Snap(`#${parentId} #clocks-minutes-svg`);

		clock.select(`#${strings.line}`).appendTo(clock);
		clock.select(`#${strings.circle}`).appendTo(clock);
		const text = clock.select(`#${strings.text}`);
		if (text && text.length > 0) {
			text.addClass('interior-white');
			text.animate({ fill: "white" }, 100, mina.easein).appendTo(clock);
		}
  },

  /**
   * activates minute on the clock that doesn't have text
   *
   * @private
   * @method minuteSectionActivate
   * @param minute {string} new active minute
   */
  minuteSectionActivate(minute, parentId) {
		let strings = TimePicker.elementNames('minutes', minute);
		let clock = new Snap(`#${parentId} #clocks-minutes-svg`);

		clock.select(`#${strings.line}`).appendTo(clock);
    clock.select(`#${strings.circle}`).appendTo(clock);
  }
});
