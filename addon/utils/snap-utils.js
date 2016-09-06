/**
* @module utils
*
*/
import Ember from 'ember';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import Snap from 'snap-svg';
import mina from 'mina';

const SnapUtils = Ember.Object.extend();
 /**
  * `Util/SnapUtils`
  *
  */
export default SnapUtils.reopenClass(
{
  /**
   * removes the hour that was passed in from the clock
   *
   * @private
   * @method removeHour
   * @param hour {string} hour to remove from clock
   */
  removeHour: function(hour)
  {
    let strings = TimePicker.hourStrings(hour);
    let clock = new Snap('#clocks-hour-svg');
    let bigCircle = clock.select('#bigCircle');

    clock.select('#' + strings.text).removeClass('interiorWhite');
    clock.select('#' + strings.line).insertBefore(bigCircle);
    clock.select('#' + strings.circle).insertBefore(bigCircle);
  },

  /**
   * removes the minute that was passed in from the clock
   *
   * @private
   * @method removeMinute
   * @param minute {string} minute to remove from clock
   */
  removeMinute: function(minute)
  {
    let strings = TimePicker.minuteStrings(minute);
    let clock = new Snap('#clock-minutes-svg');
    let bigCircle = clock.select('#bigCircleMinutes');

    if (!Ember.isNone(clock.select('#minText' + minute)))
    {
      clock.select('#' + strings.text).removeClass('interiorWhite');
    }

    clock.select('#' + strings.line).insertBefore(bigCircle);
    clock.select('#' + strings.circle).insertBefore(bigCircle);
  },

  /**
   * activates hour on the clock
   *
   * @private
   * @method hourTextActivate
   * @param hour {string} new active hour
   */
  hourTextActivate: function(hour)
  {
    let strings = TimePicker.hourStrings(hour);
    let clock = new Snap('#clocks-hour-svg');

    clock.select('#' + strings.text).addClass('interiorWhite');
    clock.select('#' + strings.line).appendTo(clock);
    clock.select('#' + strings.circle).appendTo(clock);
    clock.select('#' + strings.text).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
  },

  /**
   * activates minute with text on the clock
   *
   * @private
   * @method minuteTextActivate
   * @param minute {string} new active minute
   */
  minuteTextActivate: function(minute)
  {
      let strings = TimePicker.minuteStrings(minute);
      let clock = new Snap('#clock-minutes-svg');

      clock.select('#' + strings.line).appendTo(clock);
      clock.select('#' + strings.circle).appendTo(clock);
      clock.select('#' + strings.text).addClass('interiorWhite');
      clock.select('#' + strings.text).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
  },

  /**
   * activates minute on the clock that doesn't have text
   *
   * @private
   * @method minuteSectionActivate
   * @param minute {string} new active minute
   */
  minuteSectionActivate: function(minute)
  {
      let strings = TimePicker.minuteStrings(minute);
      let clock = new Snap('#clock-minutes-svg');

      clock.select('#' + strings.line).appendTo(clock);
      clock.select('#' + strings.circle).appendTo(clock);
  },
});
