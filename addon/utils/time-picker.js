/**
 * @module utils
 *
 */
 import Ember from 'ember';
 import moment from 'moment';

const TimePicker = Ember.Object.extend();
 /**
  * `Util/TimePicker`
  *
  */
export default TimePicker.reopenClass(
{

  /**
   * returns the hour passed in for the header
   *
   * @private
   * @method formatHourHeader
   * @param hour {number} hour you want string of
   * @return {string} hour as string
   */
  formatHourHeader: function(hour)
  {
    Ember.assert("formatHourHeader param must be a string or integer", typeof hour === 'string' || typeof hour === 'number');

    if (parseInt(hour) !== 0)
    {
      return ('0' + hour).slice(-2);
    }
    else
    {
      return '12';
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
  formatMinuteStrings: function(minute)
  {
    Ember.assert("formatMinuteStrings param must be a string or integer", typeof minute === 'string' || typeof minute === 'number');

    if (parseInt(minute) !== 60)
    {
      return ('0' + minute).slice(-2);
    }
    else
    {
      return '00';
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
  formatHourStrings: function(hour)
  {
    Ember.assert("formatHourStrings param must be a string or integer", typeof hour === 'string' || typeof hour === 'number');

    if (parseInt(hour) !== 12)
    {
      return ('0' + hour).slice(-2);
    }
    else
    {
      return '00';
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
  stringToSlicedInteger: function(string)
  {
    Ember.assert("stringToSlicedInteger param must be a string", typeof string === 'string');

    let int = string.slice(-2);
    return parseInt(int);
  },

  /**
   * returns object with names of all hour strings
   *
   * @private
   * @method hourStrings
   * @param hour {number} hour you want strings of
   * @return {object} all passed in hour strings
   */
  hourStrings: function(hour)
  {
    Ember.assert("hourStrings param must be a string or integer", typeof hour === 'string' || typeof hour === 'number');

    return {
      text: 'hour' + hour,
      line: 'line' + hour,
      circle: 'circle' + hour
    };
  },

  /**
   * returns object with names of all minute strings
   *
   * @private
   * @method minuteStrings
   * @param minute {string} minute you want strings of
   * @return {object} all passed in minute strings
   */
  minuteStrings: function(minute)
  {
    Ember.assert("minuteStrings param must be a string or integer", typeof minute === 'string' || typeof minute === 'number');

    return {
      text: 'minText' + minute,
      line: 'minLine' + minute,
      circle: 'minCircle' + minute
    };
  },

  /**
   * returns true if the minute is a multiple of five
   *
   * @private
   * @method minuteModFive
   * @param minute {number} minute to check if multiple of 5
   * @return {boolean} returns true if minute is a multiple of 5
   */
  minuteModFive: function(minute)
  {
    Ember.assert("minuteModFive param must be a string or integer", typeof minute === 'string' || typeof minute === 'number');

    if (minute % 5 === 0)
    {
      return true;
    }
    else
    {
      return false;
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
  angle: function(x, y, x2, y2)
  {
    let p0 = Math.sqrt(Math.pow(0-x, 2)+Math.pow(0-y, 2));
    let p1 = Math.sqrt(Math.pow(0-x2, 2)+Math.pow(0-y2, 2));
    let p2 = Math.sqrt(Math.pow(x2-x, 2)+Math.pow(y2-y, 2));

    return (Math.acos(((p1*p1)+(p0*p0)-(p2*p2))/(2*(p1*p0)))*360)/(2*Math.PI);
  },

  /**
   * returns the hour of the current timestamp
   *
   * @private
   * @method currentHour
   * @param timestamp {number} timestamp you want hour of
   * @return {string} hour of the current timestamp
   */
  currentHour: function(timestamp)
  {
    Ember.assert("currentHour param must be a timestamp integer or timestamp string", moment(timestamp).isValid() === true);

    let time = moment(timestamp);
    let hour = ('0' + (time.hour() % 12)).slice(-2);

    return hour;
  },

  /**
   * returns the minute of the current timestamp
   *
   * @private
   * @method currentMinute
   * @param timestamp {number} timestamp you want minute of
   * @return {string} minute of the current timestamp
   */
  currentMinute: function(timestamp)
  {
    Ember.assert("currentMinute param must be a timestamp integer or timestamp string", moment(timestamp).isValid() === true);

    let time = moment(timestamp);
    let minute = time.minute();

    return TimePicker.formatMinuteStrings(minute);
  },

  /**
   * returns the date of the current timestamp
   *
   * @private
   * @method getMinuteByDegree
   * @param timestamp {number} timestamp you want date of
   * @return {string} sting (date) of current timestamp
   */
  currentDateFormat: function(timestamp)
  {
    Ember.assert("currentDateFormat param must be a timestamp integer or timestamp string", moment(timestamp).isValid() === true);

    let time = moment(timestamp);

    return time.format('MMM DD, YYYY');
  },

  /**
   * returns true if the set timestamp is AM
   *
   * @private
   * @method timeIsAm
   * @param timestamp {number} timestamp to check meridian of
   * @return {boolean}
   */
  timeIsAm: function(timestamp)
  {
    Ember.assert("timeIsAm param must be a timestamp integer or timestamp string", moment(timestamp).isValid() === true);

    let time = moment(timestamp);
    if (time.format('A') === 'AM')
    {
        return true;
    }
    else
    {
        return false;
    }
  },

});
