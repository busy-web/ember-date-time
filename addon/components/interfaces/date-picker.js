/**
 * @module Components
 *
 */
import Ember from 'ember';
import { Assert } from 'busy-utils';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
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
   * timestamp that controls the dates for the calendar
   *
   * @private
   * @property calendarDate
   * @type Number
   */
  calendarDate: null,

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
   * day of the month shown on the calendar header - based off timestamp
   *
   * @private
   * @property day
   * @type String
   */
  day: null,

  /**
   * month of year shown on the calendar header - based off timestamp
   *
   * @private
   * @property month
   * @type String
   */
  month: null,

  /**
   * year shown on the calendar header - based off timestamp
   *
   * @private
   * @property year
   * @type String
   */
  year: null,

  /**
   * month + year string - based off calendarTimestamp
   *
   * @private
   * @property monthYear
   * @type String
   */
  monthYear: null,

  /**
   * array of all days in the current month of calendarTimestamp
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
  init() {
    this._super();
    this.resetCalendarDate();
    this.keepCalendarUpdated();
    this.updateActiveSection();
  },

  /**
   * sets the calendarDate to the timestamp and sets the values for the date picker headers
   *
   * @private
   * @method resetCalendarDate
   */
  resetCalendarDate: Ember.observer('timestamp', function() {
		const timestamp = this.get('timestamp');
		Assert.isNumber(timestamp);

		// get moment timestamp
		const time = TimePicker.getMomentDate(this.get('timestamp'));
		if (TimePicker.isValidDate(time)) {
			this.set('calendarDate', this.get('timestamp'));
			this.set('year', time.format('YYYY'));
			this.set('month', time.format('MMM').toUpperCase());
			this.set('day', time.format('DD'));
			this.set('dayOfWeek', time.format('dddd'));
		} else {
			Assert.throw("timestamp must be a valid unix timestamp");
		}
  }),

  /**
   * updates to the new active header  (day, month, or year)
   *
   * @private
   * @method updateActiveSection
   */
  updateActiveSection: Ember.observer('calendarActiveSection', function() {
    let section = this.get('calendarActiveSection');

    if (section === 'day') {
      this.set('dayActive', 'active');
      this.set('monthActive', null);
      this.set('yearActive', null);
      this.set('monthYearActive', null);
    } else if (section === 'month') {
      this.set('monthActive', 'active');
      this.set('dayActive', null);
      this.set('yearActive', null);
      this.set('monthYearActive', null);
    } else if (section === 'year') {
      this.set('yearActive', 'active');
      this.set('monthActive', null);
      this.set('dayActive', null);
      this.set('monthYearActive', null);
    } else if (section === 'month-year') {
      this.set('monthYearActive', 'active');
      this.set('monthActive', null);
      this.set('dayActive', null);
      this.set('yearActive', null);
    }
  }),

  /**
   * re configures the calendar when calendarDate is changed, sets the monthYear calendar header
   *
   * @private
   * @method keepCalendarUpdated
   */
  keepCalendarUpdated: Ember.observer('calendarDate', function() {
    const calendarObject = TimePicker.getMomentDate(this.get('calendarDate'));
    this.buildDaysArrayForMonth();
    this.set('monthYear', calendarObject.format('MMM YYYY'));
  }),

  /**
   * makes moment objects for each day in month, disables them if they exceed max/min date
   *
   * @private
   * @method buildDaysArrayForMonth
   */
  buildDaysArrayForMonth: function() {
		const calendarDate = this.get('calendarDate');
    const minDate =	this.get('minDate');
    const maxDate = this.get('maxDate');
		const isMilliseconds = this.get('isMilliseconds');

		const currentCalendar = TimePicker.getMomentDate(calendarDate, isMilliseconds);
    const currentTime = TimePicker.getMomentDate(this.get('timestamp'), isMilliseconds);
    const firstDay = TimePicker.getMomentDate(calendarDate, isMilliseconds).startOf('month');
    const lastDay = TimePicker.getMomentDate(calendarDate, isMilliseconds).endOf('month').date();

		const start = firstDay.day();
    let currentDay = firstDay;
		currentDay.subtract(start, 'days');

		let daysInCalendar = 28;
		if ((start + lastDay) > 35) {
			daysInCalendar = 42;
		} else if ((start + lastDay) > 28) {
			daysInCalendar = 35;
		}

		const daysArray = Ember.A();
    for (let i=0; i<daysInCalendar; i++) {
			const paper = TimePicker.createPaperDate({timestamp: currentDay.valueOf()});

			const { isBefore, isAfter } = TimePicker.isDateInBounds(paper.get('date'), minDate, maxDate, isMilliseconds);
			paper.set('isBefore', isBefore);
			paper.set('isAfter', isAfter);
			paper.set('weekNumber', Math.ceil((i+1)/7));

			if (paper.get('date').year() === currentCalendar.year()) {
				paper.set('isCurrentYear', true);

				if (paper.get('date').month() === currentCalendar.month()) {
					paper.set('isCurrentMonth', true);
				}
			}

			if (paper.get('date').year() === currentTime.year() && paper.get('date').month() === currentTime.month() && paper.get('date').date() === currentTime.date()) {
				paper.set('isCurrentDay', true);
			}

			daysArray.pushObject(paper);
			currentDay.add(1, 'days');
    }

    this.groupByWeeks(daysArray);
  },

   /**
   * groups days into week objects
   *
   * @private
   * @method groupByWeeks
   */
  groupByWeeks(completeArray) {
    let grouped = Ember.A([]);

    grouped.pushObject(completeArray.filterBy('weekNumber', 1));
    grouped.pushObject(completeArray.filterBy('weekNumber', 2));
    grouped.pushObject(completeArray.filterBy('weekNumber', 3));
    grouped.pushObject(completeArray.filterBy('weekNumber', 4));
    grouped.pushObject(completeArray.filterBy('weekNumber', 5));
    grouped.pushObject(completeArray.filterBy('weekNumber', 6));

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
  inRange(lower, upper) {
    Assert.isNumber(lower);
    Assert.isNumber(upper);

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
  setTimestamp(date) {
    Assert.isMoment(date);

    if (this.get('isMilliseconds')) {
      this.set('timestamp', date.valueOf());
    } else {
      this.set('timestamp', date.unix());
    }
  },

  /**
   * receives a moment object and sets it to calendarTimestamp
   *
   * @private
   * @method setCalendarTimestamp
   * @param moment {object} moment object
   */
  setCalendarDate(date) {
    Assert.isMoment(date);

    if (this.get('isMilliseconds')) {
      this.set('calendarDate', date.valueOf());
    } else {
      this.set('calendarDate', date.unix());
    }
  },

  actions: {

    /**
     * sets the timestamp to the clicked day
     *
     * @param day {object} moment object of the clicked day
     * @event dayClicked
     */
    dayClicked(paper) {
			const day = paper.get('date');

      Assert.isMoment(day);

      const newDay = day.date();
      const newMonth = day.month();
      const newYear = day.year();

      let timestamp = TimePicker.getMomentDate(this.get('timestamp'));
      timestamp.date(newDay);
      timestamp.month(newMonth);
      timestamp.year(newYear);

      this.setTimestamp(timestamp);
    },

    /**
     * subtracts 1 month to the calendarDate
     *
     * @event subtractMonth
     */
    subtractMonth() {
      const calDate = TimePicker.getMomentDate(this.get('calendarDate'));
      this.setCalendarDate(calDate.subtract('1', 'months'));
      this.set('calendarActiveSection', 'month-year');
    },

    /**
     * adds 1 month to the calendarDate
     *
     * @event addMonth
     */
    addMonth() {
      const calDate = TimePicker.getMomentDate(this.get('calendarDate'));
      let add = calDate.add('1', 'months');

      this.setCalendarDate(add);
      this.set('calendarActiveSection', 'month-year');
    }
  }
});
