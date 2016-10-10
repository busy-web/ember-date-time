/**
 * @module Components
 *
 */
import Ember from 'ember';
import moment from 'moment';
import Time from 'busy-utils/time';
import layout from '../../templates/components/interfaces/date-picker';

/**
 * `Component/DatePicker`
 *
 * @class DatePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({

  /**
   * @private
   * @property classNames
   * @type String
   * @default date-picker
   */
  classNames: ['paper-date-picker'],
  layout: layout,

  /**
   * timestamp that is passed in when using date picker
   *
   * @private
   * @property timestamp
   * @type Number
   */
  timestamp: null,

  /**
   * timestamp that controls the dates for the calender
   *
   * @private
   * @property calenderDate
   * @type Number
   */
  calenderDate: null,

  /**
   * can be passed in so a date before the minDate cannot be selected
   *
   * @private
   * @property minDate
   * @type Number
   * @optional
   */
  minDate: null,

  /**
   * can be passed in so a date after the maxDate cannot be selected
   *
   * @private
   * @property maxDate
   * @type Number
   * @optional
   */
  maxDate: null,

  /**
   * can be passed in as true or false, true sets timepicker to handle unix timestamp * 1000, false sets it to handle unix timestamp
   *
   * @private
   * @property isMilliseconds
   * @type boolean
   * @optional
   */
  isMilliseconds: false,

  /**
   * day of the month shown on the calender header - based off timestamp
   *
   * @private
   * @property day
   * @type String
   */
  day: null,

  /**
   * month of year shown on the calender header - based off timestamp
   *
   * @private
   * @property month
   * @type String
   */
  month: null,

  /**
   * year shown on the calender header - based off timestamp
   *
   * @private
   * @property year
   * @type String
   */
  year: null,

  /**
   * month + year string - based off calenderTimestamp
   *
   * @private
   * @property monthYear
   * @type String
   */
  monthYear: null,

  /**
   * array of all days in the current month of calenderTimestamp
   *
   * @private
   * @property daysArray
   * @type Array
   */
  daysArray: null,

  /**
   * based on daysArray, Adds blank days to the front and back of array according to starting day of month
   *
   * @private
   * @property completeDaysArray
   * @type Array
   */
  completeDaysArray: null,

  /**
   * based on completeDaysArray, Adds current day and minDate - maxDate properties
   *
   * @private
   * @property completeArray
   * @type Array
   */
  completeArray: null,

  /**
   * based on completeArray, groups days into 6 week arrays
   *
   * @private
   * @property groupedArray
   * @type Array
   */
  groupedArray: null,

  /**
   * becomes string 'active' (binded to classes in template) if monthActive is active
   *
   * @private
   * @property monthActive
   * @type String
   */
  monthActive: null,

  /**
   * becomes string 'active' (binded to classes in template) if dayActive is active
   *
   * @private
   * @property monthActive
   * @type dayActive
   */
  dayActive: null,

  /**
   * becomes string 'active' (binded to classes in template) if yearActive is active
   *
   * @private
   * @property yearActive
   * @type String
   */
  yearActive: null,

  /**
   * becomes string 'active' (binded to classes in template) if monthYearActive is active
   *
   * @private
   * @property monthYearActive
   * @type String
   */
  monthYearActive: null,


  /**
   * @private
   * @method init
   * @constructor
   */
  init: function()
  {
    this._super();
    this.resetCalenderDate();
    this.keepCalenderUpdated();
    this.updateActiveSection();
  },

  /**
   * returns the correct moment objects, depending on if the timestamps are milliseconds or not
   *
   * @private
   * @method getCorrectMomentObjects
   * @return object
   */
  getCorrectMomentObjects: function() {
    let time, minDate, maxDate, calenderTime;
    if (this.get('isMilliseconds')) {
      time = moment(this.get('timestamp'));
      minDate = moment(this.get('minDate'));
      maxDate = moment(this.get('maxDate'));
      calenderTime = moment(this.get('calenderDate'));
    } else {
      time = Time.date(this.get('timestamp'));
      minDate = Time.date(this.get('minDate'));
      maxDate = Time.date(this.get('maxDate'));
      calenderTime = Time.date(this.get('calenderDate'));
    }

    return {time, minDate, maxDate, calenderTime};
  },
  
  /**
   * sets the calenderDate to the timestamp and sets the values for the date picker headers
   *
   * @private
   * @method resetCalenderDate
   */
  resetCalenderDate: Ember.observer('timestamp', function()
  {
    Ember.assert("timestamp must be a valid unix timestamp", Ember.isNone(this.get('timestamp')) || typeof this.get('timestamp') === 'number');

    let timestamps = this.getCorrectMomentObjects();

    if (!Ember.isNone(this.get('timestamp')))
    {
      if (moment.isMoment(timestamps.time) && timestamps.time.isValid())
      {
        this.set('calenderDate', this.get('timestamp'));

        this.set('year', timestamps.time.format('YYYY'));
        this.set('month', timestamps.time.format('MMM').toUpperCase());
        this.set('day', timestamps.time.format('DD'));
        this.set('dayOfWeek', timestamps.time.format('dddd'));
      }
    }
    else
    {
      Ember.assert("timestamp must be a valid unix timestamp", moment.isMoment(timestamps.time) && timestamps.time.isValid());
    }
  }),

  /**
   * updates to the new active header  (day, month, or year)
   *
   * @private
   * @method updateActiveSection
   */
  updateActiveSection: Ember.observer('calenderActiveSection', function()
  {
    let section = this.get('calenderActiveSection');

    if (section === 'day')
    {
      this.set('dayActive', 'active');
      this.set('monthActive', null);
      this.set('yearActive', null);
      this.set('monthYearActive', null);
    }
    if (section === 'month')
    {
      this.set('monthActive', 'active');
      this.set('dayActive', null);
      this.set('yearActive', null);
      this.set('monthYearActive', null);

    }
    if (section === 'year')
    {
      this.set('yearActive', 'active');
      this.set('monthActive', null);
      this.set('dayActive', null);
      this.set('monthYearActive', null);
    }

    if (section === 'month-year')
    {
      this.set('monthYearActive', 'active');
      this.set('monthActive', null);
      this.set('dayActive', null);
      this.set('yearActive', null);
    }
  }),

  /**
   * re configures the calender when calenderDate is changed, sets the monthYear calender header
   *
   * @private
   * @method keepCalenderUpdated
   */
  keepCalenderUpdated: Ember.observer('calenderDate', function()
  {
    let timestamps = this.getCorrectMomentObjects();
    const calenderObject = timestamps.calenderTime;

    this.buildDaysArrayForMonth(calenderObject);
    this.set('monthYear', calenderObject.format('MMM YYYY'));
  }),

  /**
   * makes moment objects for each day in month, disables them if they exceed max/min date
   *
   * @private
   * @method buildDaysArrayForMonth
   * @param calenderObject {object} moment object used for calender
   */
  buildDaysArrayForMonth: function(calenderObject) {

    let timestamps = this.getCorrectMomentObjects();
    const current = calenderObject;

    let daysArray = Ember.A();
    const firstDay = current.clone().startOf('month').hour(current.hour()).minute(current.minute()).endOf('minute');
    const lastDay = current.clone().endOf('month').hour(current.hour()).minute(current.minute()).endOf('minute');
    let currentDay = firstDay;

    while (currentDay.isBefore(lastDay)) {
      if (!Ember.isNone(this.get('minDate')) || !Ember.isNone(this.get('maxDate')))
      {
        if (currentDay.isBetween(timestamps.minDate, timestamps.maxDate))
        {
            currentDay.isDisabled = false;
            daysArray.pushObject(currentDay);
            currentDay = currentDay.clone().add('days', 1);
        }
        else
        {
            currentDay.isDisabled = true;
            daysArray.pushObject(currentDay);
            currentDay = currentDay.clone().add('days', 1);
        }
      }
      else
      {
        currentDay.isDisabled = false;
        daysArray.pushObject(currentDay);
        currentDay = currentDay.clone().add('days', 1);
      }
    }

    this.currentDayOnCalender(daysArray);
  },

  /**
   * sets active to the current active day
   *
   * @private
   * @method currentDayOnCalender
   */
  currentDayOnCalender: function(daysArray)
  {
    let timestamps = this.getCorrectMomentObjects();
    let completeDaysArray = Ember.A();
    let currentTime = timestamps.time;

    daysArray.forEach((item) => {
      let startItem = item.clone();
      let endItem = item.clone();
      let startOfDay = startItem.startOf('day');
      let endOfDay = endItem.endOf('day');

      if (currentTime.isBetween(startOfDay, endOfDay))
      {
        item.isCurrentDay = true;
        item.dayOfMonth = item.date();
        completeDaysArray.push(item);
      }
      else
      {
        item.isCurrentDay = false;
        item.dayOfMonth = item.date();
        completeDaysArray.push(item);
      }
    });

    this.buildCompleteArray(completeDaysArray);
  },

  /**
   * builds an array of days in a month, starting at sunday
   *
   * @private
   * @method buildCompleteArray
   */
  buildCompleteArray: function(completeDaysArray)
{
    let nullHeadLength = 0;
    let monthArrayLength = 42;
    let firstDayPosition = completeDaysArray.get('firstObject').day();
    let numberOfDays = completeDaysArray.get('length');

    let completeArray = Ember.A();

    for (let i=0; i<firstDayPosition; i++) {
      nullHeadLength++;
      completeArray.push(null);
    }

    completeDaysArray.forEach(function(day)
    {
      completeArray.push(day);
    });

    let nullTailLength = monthArrayLength - nullHeadLength - numberOfDays;

    for (let x=0; x<nullTailLength; x++) {
      nullHeadLength++;
      completeArray.push(null);
    }
    this.groupByWeeks(completeArray);
  },

   /**
   * groups days into week objects
   *
   * @private
   * @method groupByWeeks
   */
  groupByWeeks: function(completeArray)
  {
    let grouped = Ember.A([]);

    grouped.pushObject(completeArray.filter(this.inRange(0, 7)));
    grouped.pushObject(completeArray.filter(this.inRange(7, 14)));
    grouped.pushObject(completeArray.filter(this.inRange(14, 21)));
    grouped.pushObject(completeArray.filter(this.inRange(21, 28)));
    grouped.pushObject(completeArray.filter(this.inRange(28, 35)));
    grouped.pushObject(completeArray.filter(this.inRange(35, 42)));

    this.set('groupedArray', grouped);
  },

  /**
   * puts days into week objects
   *
   * @private
   * @method inRange
   * @param lower {number} first number in week
   * @param upper {number} last number in week
   * @return {boolean} true if day is in week, otherwise false
   */
  inRange: function(lower, upper)
  {
    Ember.assert("lower and upper must be numbers", typeof lower === 'number' || typeof upper === 'number');

    return function (each, index) {

      return (index >= lower && index < upper);
    };

  },

  /**
   * receives a moment object and sets it to timestamp
   *
   * @private
   * @method setTimestamp
   * @param moment {object} moment object
   */
  setTimestamp: function(moment)
  {
    Ember.assert("setTimestamp param must be a timestamp integer or timestamp string", moment.isValid() === true);

    if (this.get('isMilliseconds'))
    {
      let reverse = Time.timestamp(moment);
      this.set('timestamp', reverse);
    }
    else
    {
      let reverse = moment.unix();
      this.set('timestamp', reverse);
    }
  },

  /**
   * receives a moment object and sets it to calenderTimestamp
   *
   * @private
   * @method setCalenderTimestamp
   * @param moment {object} moment object
   */
  setCalenderDate: function(moment)
  {
    Ember.assert("setCalenderDate param must be a timestamp integer or timestamp string", moment.isValid() === true);

    if (this.get('isMilliseconds'))
    {
      let reverse = Time.timestamp(moment);
      this.set('calenderDate', reverse);
    }
    else
    {
      let reverse = moment.unix();
      this.set('calenderDate', reverse);
    }

  },

  actions: {

    /**
     * sets the timestamp to the clicked day
     *
     * @param day {object} moment object of the clicked day
     * @event dayClicked
     */
    dayClicked(day)
    {
      let timestamps = this.getCorrectMomentObjects();

      const newDay = day.date();
      const newMonth = day.month();
      const newYear = day.year();

      let timestamp = timestamps.time;
          timestamp.date(newDay);
          timestamp.month(newMonth);
          timestamp.year(newYear);

      this.setTimestamp(timestamp);
    },

    /**
     * subtracts 1 month to the calenderDate
     *
     * @event subtractMonth
     */
    subtractMonth()
    {
      let timestamps = this.getCorrectMomentObjects();
      let calDate = timestamps.calenderTime;
      let subtract = calDate.subtract('1', 'months');

      this.setCalenderDate(subtract);
      this.set('calenderActiveSection', 'month-year');
    },

    /**
     * adds 1 month to the calenderDate
     *
     * @event addMonth
     */
    addMonth()
    {
      let timestamps = this.getCorrectMomentObjects();
      let calDate = timestamps.calenderTime;
      let add = calDate.add('1', 'months');

      this.setCalenderDate(add);
      this.set('calenderActiveSection', 'month-year');
    }
  }
});
