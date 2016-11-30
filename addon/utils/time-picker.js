/**
 * @module utils
 *
 */
import Ember from 'ember';
import Assert from 'busy-utils/assert';

/***/
const TimePicker = Ember.Object.extend();

/**
 * `Util/TimePicker`
 *
 */
export default TimePicker.reopenClass({
  /**
   * returns the hour passed in for the header
   *
   * @private
   * @method formatHourHeader
   * @param hour {number} hour you want string of
   * @return {string} hour as string
   */
  formatHourHeader(hour) {
    if (typeof hour === 'string' || typeof hour === 'number') {
      if (parseInt(hour, 10) !== 0) {
        return ('0' + hour).slice(-2);
      } else {
        return '12';
      }
    } else {
      Assert.throw("formatHourHeader param must be a string or integer");
    }
  },

  /**
   * returns the minute passed in - formatted correctly
   *
   * @private
   * @method formatMinuteStrings
   * @param minute {number} minute you want string of
   * @return {string} minute as string
   */
  formatMinuteStrings(minute) {
    if (typeof minute === 'string' || typeof minute === 'number') {
      if (parseInt(minute, 10) !== 60) {
        return ('0' + minute).slice(-2);
      } else {
        return '00';
      }
    } else {
      Assert.throw("formatMinuteStrings param must be a string or integer");
    }
  },

  /**
   * returns the hour passed in - formatted correctly
   *
   * @private
   * @method formatHourStrings
   * @param hour {number} hour you want string of
   * @return {string} hour as string
   */
  formatHourStrings(hour) {
    if (typeof hour === 'string' || typeof hour === 'number') {
      if (parseInt(hour, 10) !== 12) {
        return ('0' + hour).slice(-2);
      } else {
        return '00';
      }
    } else {
      Assert.throw("formatHourStrings param must be a string or integer");
    }
  },

  /**
   * formats string to an integer
   *
   * @private
   * @method stringToSlicedInteger
   * @param string {string} string you want integer of
   * @return {number} passed in string as integer
   */
  stringToSlicedInteger(string) {
    Assert.isString(string);

    let int = string.slice(-2);
    return parseInt(int, 10);
  },

  /**
   * returns object with names of all hour strings
   *
   * @private
   * @method hourStrings
   * @param hour {number} hour you want strings of
   * @return {object} all passed in hour strings
   */
  hourStrings(hour) {
    if (typeof hour === 'string' || typeof hour === 'number') {
      return {
        "text": `hour-${hour}`,
        "line": `line-${hour}`,
        "circle": `circle-${hour}`
      };
    } else {
      Assert.throw("hourStrings param must be a string or integer");
    }
  },

  /**
   * returns object with names of all minute strings
   *
   * @private
   * @method minuteStrings
   * @param minute {string} minute you want strings of
   * @return {object} all passed in minute strings
   */
  minuteStrings(minute) {
    if (typeof minute === 'string' || typeof minute === 'number') {
      return {
        "text": `min-text-${minute}`,
        "line": `min-line-${minute}`,
        "circle": `min-circle-${minute}`
      };
    } else {
      Assert.throw("minuteStrings param must be a string or integer");
    }
  },

  /**
   * returns true if the minute is a multiple of five
   *
   * @private
   * @method minuteModFive
   * @param minute {number} minute to check if multiple of 5
   * @return {boolean} returns true if minute is a multiple of 5
   */
  minuteModFive(minute) {
    if (typeof minute === 'string' || typeof minute === 'number') {
      if (minute % 5 === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      Assert.throw("minuteModFive param must be a string or integer");
    }
  },

  /**
   * gets the angle at which the drag is taking place
   *
   * @private
   * @method angle
   * @param x {number} point 1 x value
   * @param y {number} point 1 y value
   * @param x2 {number} point 2 x value
   * @param y2 {number} point 2 y value
   * @return {number} angle from point 1 to point 2
   */
  angle(x, y, x2, y2) {
    let p0 = Math.sqrt(Math.pow(0-x, 2)+Math.pow(0-y, 2));
    let p1 = Math.sqrt(Math.pow(0-x2, 2)+Math.pow(0-y2, 2));
    let p2 = Math.sqrt(Math.pow(x2-x, 2)+Math.pow(y2-y, 2));

    return (Math.acos(((p1*p1)+(p0*p0)-(p2*p2))/(2*(p1*p0)))*360)/(2*Math.PI);
  },

  /**
   * returns the hour of the current momentObject formatted as length 2 string
   *
   * @private
   * @method currentHour
   * @param momentObject {moment}
   * @return {string} hour of the current timestamp
   */
  currentHour(momentObject) {
    Assert.isMoment(momentObject);

    let hour = ('0' + (momentObject.hour() % 12)).slice(-2);
    return hour;
  },

  /**
   * returns the minute of the current momentObject
   *
   * @private
   * @method currentMinute
   * @param momentObject {moment}
   * @return {string} minute of the current timestamp
   */
  currentMinute(momentObject) {
    Assert.isMoment(momentObject);

    let minute = momentObject.minute();
    return TimePicker.formatMinuteStrings(minute);
  },

  /**
   * returns the date of the current momentObject
   *
   * @private
   * @method getMinuteByDegree
   * @param momentObject {moment}
   * @return {string} sting (date) of current moment object
   */
  currentDateFormat(momentObject) {
    Assert.isMoment(momentObject);

    return momentObject.format('MMM DD, YYYY');
  },

  /**
   * returns true if the set timestamp is AM
   *
   * @private
   * @method timeIsAm
   * @param momentObject {moment}
   * @return {boolean}
   */
  timeIsAm(momentObject) {
    Assert.isMoment(momentObject);

    if (momentObject.format('A') === 'AM') {
      return true;
    } else {
      return false;
    }
  }
});
